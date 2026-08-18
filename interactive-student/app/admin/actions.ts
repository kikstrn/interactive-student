"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (profile?.is_admin !== true) {
        redirect("/dashboard");
    }

    return user;
}

export type AdminActionResult = {
    success: boolean;
    message?: string;
};

export async function inviteTeacher(
    formData: FormData
): Promise<AdminActionResult> {
    await requireAdmin();

    const email = String(
        formData.get("email") ?? ""
    )
        .trim()
        .toLowerCase();

    if (!email || !email.includes("@")) {
        return {
            success: false,
            message:
                "Adresse email invalide.",
        };
    }

    const admin =
        createAdminClient();

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://klikao.kstudio.workers.dev";

    const {
        data,
        error,
    } =
        await admin.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: `${appUrl}/invite`,
                data: {
                    invited_by_admin: true,
                },
            }
        );

    if (error) {
        console.error(
            "inviteTeacher:",
            error
        );

        return {
            success: false,
            message:
                error.message ||
                "Impossible d'envoyer l'invitation.",
        };
    }

    if (data.user) {
        await admin
            .from("profiles")
            .upsert(
                {
                    id: data.user.id,
                    email,
                    access_status:
                        "invited",
                    invited_at:
                        new Date().toISOString(),
                    updated_at:
                        new Date().toISOString(),
                },
                {
                    onConflict: "id",
                }
            );
    }

    revalidatePath("/admin");
    revalidatePath(
        "/admin/teachers"
    );

    return {
        success: true,
        message:
            "Invitation envoyée.",
    };
}

export async function updateTeacherAccess(
    userId: string,
    status: string
): Promise<AdminActionResult> {
    await requireAdmin();

    const allowed = [
        "invited",
        "active",
        "suspended",
        "cancelled",
    ];

    if (
        !allowed.includes(status)
    ) {
        return {
            success: false,
            message:
                "Statut invalide.",
        };
    }

    const admin =
        createAdminClient();

    /*
     * Le statut applicatif protège immédiatement les routes KLIKAO.
     * Le ban Supabase empêche aussi les futures authentifications /
     * renouvellements de session d'un compte suspendu ou annulé.
     */
    const shouldBan =
        status === "suspended" ||
        status === "cancelled";

    const { error: authError } =
        await admin.auth.admin.updateUserById(
            userId,
            {
                ban_duration: shouldBan
                    ? "876000h"
                    : "none",
            }
        );

    if (authError) {
        console.error(
            "updateTeacherAccess auth:",
            authError
        );

        return {
            success: false,
            message:
                "Impossible de modifier l'accès d'authentification.",
        };
    }

    const {
        data: authUserResult,
    } =
        await admin.auth.admin.getUserById(
            userId
        );

    const authEmail =
        authUserResult.user?.email ??
        null;

    const { error } = await admin
        .from("profiles")
        .upsert(
            {
                id: userId,
                email: authEmail,
                access_status: status,
                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict: "id",
            }
        );

    if (error) {
        console.error(
            "updateTeacherAccess:",
            error
        );

        // Évite un état incohérent si la mise à jour du profil échoue.
        await admin.auth.admin.updateUserById(
            userId,
            {
                ban_duration: shouldBan
                    ? "none"
                    : "876000h",
            }
        );

        return {
            success: false,
            message:
                "Impossible de modifier le statut.",
        };
    }

    revalidatePath("/admin");
    revalidatePath(
        "/admin/teachers"
    );

    return {
        success: true,
    };
}

export async function resendTeacherInvite(
    email: string
): Promise<AdminActionResult> {
    await requireAdmin();

    const admin =
        createAdminClient();

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://klikao.kstudio.workers.dev";

    const { error } =
        await admin.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: `${appUrl}/invite`,
                data: {
                    invited_by_admin: true,
                },
            }
        );

    if (error) {
        console.error(
            "resendTeacherInvite:",
            error
        );

        return {
            success: false,
            message:
                error.message ||
                "Impossible de renvoyer l'invitation.",
        };
    }

    revalidatePath(
        "/admin/teachers"
    );

    return {
        success: true,
    };
}

export async function approveAccessRequest(
    requestId: string
): Promise<AdminActionResult> {
    const adminUser =
        await requireAdmin();

    const admin =
        createAdminClient();

    const { data: request } =
        await admin
            .from("access_requests")
            .select(`
                id,
                first_name,
                last_name,
                email,
                requested_grade,
                status
            `)
            .eq("id", requestId)
            .single();

    if (!request) {
        return {
            success: false,
            message:
                "Demande introuvable.",
        };
    }

    if (
        request.status === "invited" ||
        request.status === "approved"
    ) {
        return {
            success: false,
            message:
                "Cette demande a déjà été validée.",
        };
    }

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://klikao.kstudio.workers.dev";

    const {
        data: inviteData,
        error: inviteError,
    } =
        await admin.auth.admin.inviteUserByEmail(
            request.email,
            {
                redirectTo: `${appUrl}/invite`,
                data: {
                    invited_by_admin:
                        true,
                    requested_grade:
                        request.requested_grade,
                },
            }
        );

    if (inviteError) {
        console.error(
            "approveAccessRequest invite:",
            inviteError
        );

        return {
            success: false,
            message:
                inviteError.message ||
                "Impossible d'envoyer l'invitation.",
        };
    }

    const invitedUser =
        inviteData.user;

    if (invitedUser) {
        const { error: profileError } =
            await admin
                .from("profiles")
                .upsert(
                    {
                        id: invitedUser.id,
                        email:
                            request.email,
                        first_name:
                            request.first_name,
                        last_name:
                            request.last_name,
                        primary_grade:
                            request.requested_grade,
                        access_status:
                            "invited",
                        subscription_status:
                            "trial",
                        trial_started_at:
                            new Date().toISOString(),
                        invited_at:
                            new Date().toISOString(),
                        updated_at:
                            new Date().toISOString(),
                    },
                    {
                        onConflict: "id",
                    }
                );

        if (profileError) {
            console.error(
                "approveAccessRequest profile:",
                profileError
            );
        }
    }

    const { error: requestError } =
        await admin
            .from("access_requests")
            .update({
                status: "invited",
                reviewed_at:
                    new Date().toISOString(),
                reviewed_by:
                    adminUser.id,
                auth_user_id:
                    invitedUser?.id ??
                    null,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", requestId);

    if (requestError) {
        console.error(
            "approveAccessRequest request:",
            requestError
        );
    }

    revalidatePath("/admin");
    revalidatePath(
        "/admin/requests"
    );
    revalidatePath(
        "/admin/teachers"
    );

    return {
        success: true,
        message:
            "Demande acceptée et invitation envoyée.",
    };
}

export async function rejectAccessRequest(
    requestId: string
): Promise<AdminActionResult> {
    const adminUser =
        await requireAdmin();

    const admin =
        createAdminClient();

    const { error } = await admin
        .from("access_requests")
        .update({
            status: "rejected",
            reviewed_at:
                new Date().toISOString(),
            reviewed_by:
                adminUser.id,
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("status", "pending");

    if (error) {
        console.error(
            "rejectAccessRequest:",
            error
        );

        return {
            success: false,
            message:
                "Impossible de refuser cette demande.",
        };
    }

    revalidatePath("/admin");
    revalidatePath(
        "/admin/requests"
    );

    return {
        success: true,
        message:
            "Demande refusée.",
    };
}

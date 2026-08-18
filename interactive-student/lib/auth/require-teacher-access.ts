import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type TeacherAccessOptions = {
    allowInvited?: boolean;
};

export async function requireTeacherAccess(
    options: TeacherAccessOptions = {}
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select(`
            is_admin,
            access_status,
            onboarding_completed
        `)
        .eq("id", user.id)
        .single();

    // Un administrateur conserve l'accès à son espace enseignant.
    if (profile?.is_admin === true) {
        return {
            user,
            profile,
        };
    }

    const status =
        profile?.access_status ?? "active";

    if (
        status === "suspended" ||
        status === "cancelled"
    ) {
        redirect(
            `/access-blocked?status=${status}`
        );
    }

    if (
        status === "invited" &&
        options.allowInvited !== true
    ) {
        redirect("/onboarding");
    }

    if (
        profile?.onboarding_completed ===
            false &&
        options.allowInvited !== true
    ) {
        redirect("/onboarding");
    }

    return {
        user,
        profile,
    };
}

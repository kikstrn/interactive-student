"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedGrades = [
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
];

export type CompleteOnboardingResult = {
    success: boolean;
    reason?: string;
    packImported?: number;
    packAlreadyImported?: number;
};

export async function completeOnboarding(
    formData: FormData
): Promise<CompleteOnboardingResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const grade = String(
        formData.get("grade") ?? ""
    ).trim();

    const className = String(
        formData.get("className") ?? ""
    ).trim();

    const schoolYear = String(
        formData.get("schoolYear") ?? ""
    ).trim();

    const installPack =
        formData.get("installPack") ===
        "true";

    const pin = String(
        formData.get("pin") ?? ""
    );

    const confirmPin = String(
        formData.get("confirmPin") ?? ""
    );

    if (!allowedGrades.includes(grade)) {
        return {
            success: false,
            reason: "invalid_grade",
        };
    }

    if (!className) {
        return {
            success: false,
            reason: "missing_class_name",
        };
    }

    if (!/^\d{4}$/.test(pin)) {
        return {
            success: false,
            reason: "invalid_pin",
        };
    }

    if (pin !== confirmPin) {
        return {
            success: false,
            reason: "pin_mismatch",
        };
    }

    // Crée la classe uniquement si elle n'existe pas déjà.
    const { data: existingClass } =
        await supabase
            .from("classes")
            .select("id")
            .eq("teacher_id", user.id)
            .eq("name", className)
            .limit(1)
            .maybeSingle();

    if (!existingClass) {
        const { error: classError } =
            await supabase
                .from("classes")
                .insert({
                    teacher_id: user.id,
                    name: className,
                    grade,
                    school_year:
                        schoolYear || null,
                });

        if (classError) {
            console.error(
                "Onboarding class:",
                classError
            );

            return {
                success: false,
                reason: "class_error",
            };
        }
    }

    const { error: pinError } =
        await supabase.rpc(
            "set_teacher_pin",
            {
                new_pin: pin,
            }
        );

    if (pinError) {
        console.error(
            "Onboarding PIN:",
            pinError
        );

        return {
            success: false,
            reason: "pin_error",
        };
    }

    let packImported = 0;
    let packAlreadyImported = 0;

    if (installPack) {
        const {
            data: packResult,
            error: packError,
        } = await supabase.rpc(
            "install_official_grade_pack",
            {
                p_grade: grade,
            }
        );

        if (packError) {
            console.error(
                "Onboarding pack:",
                packError
            );

            // Le pack est une aide : on ne bloque pas
            // l'activation du compte si son installation échoue.
        } else {
            packImported = Number(
                packResult?.imported ?? 0
            );

            packAlreadyImported = Number(
                packResult
                    ?.already_imported ?? 0
            );
        }
    }

    const { error: profileError } =
        await supabase
            .from("profiles")
            .update({
                primary_grade: grade,
                pin_configured: true,
                onboarding_completed: true,
                access_status: "active",
                tutorial_completed: false,
                tutorial_skipped: false,
                tutorial_step: 0,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", user.id);

    if (profileError) {
        console.error(
            "Onboarding profile:",
            profileError
        );

        return {
            success: false,
            reason: "profile_error",
        };
    }

    revalidatePath("/dashboard");
    revalidatePath("/categories");
    revalidatePath("/workshop");
    revalidatePath("/settings");

    return {
        success: true,
        packImported,
        packAlreadyImported,
    };
}

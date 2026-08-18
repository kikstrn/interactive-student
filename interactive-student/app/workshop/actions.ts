"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ImportWorkshopResult = {
    success: boolean;
    alreadyImported?: boolean;
    categoryId?: string;
    reason?: string;
};

export async function importWorkshopExercise(
    workshopId: string
): Promise<ImportWorkshopResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data, error } = await supabase.rpc(
        "import_workshop_exercise",
        {
            p_workshop_id: workshopId,
        }
    );

    if (error) {
        console.error(error);
        return {
            success: false,
            reason: "error",
        };
    }

    revalidatePath("/workshop");
    revalidatePath("/categories");
    revalidatePath("/dashboard");

    if (data?.category_id) {
        revalidatePath(`/categories/${data.category_id}`);
    }

    return {
        success: data?.success === true,
        alreadyImported: data?.already_imported === true,
        categoryId: data?.category_id,
        reason: data?.reason,
    };
}

export type InstallOfficialPackResult = {
    success: boolean;
    grade?: string;
    total?: number;
    imported?: number;
    alreadyImported?: number;
    reason?: string;
};

const allowedPrimaryGrades = [
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
];

export async function installOfficialGradePack(
    grade: string
): Promise<InstallOfficialPackResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (!allowedPrimaryGrades.includes(grade)) {
        return {
            success: false,
            reason: "invalid_grade",
        };
    }

    const { data, error } = await supabase.rpc(
        "install_official_grade_pack",
        {
            p_grade: grade,
        }
    );

    if (error) {
        console.error(
            "installOfficialGradePack:",
            error
        );

        return {
            success: false,
            reason: "error",
        };
    }

    revalidatePath("/workshop");
    revalidatePath("/categories");
    revalidatePath("/dashboard");

    return {
        success: data?.success === true,
        grade: data?.grade ?? grade,
        total: Number(data?.total ?? 0),
        imported: Number(
            data?.imported ?? 0
        ),
        alreadyImported: Number(
            data?.already_imported ?? 0
        ),
        reason: data?.reason,
    };
}

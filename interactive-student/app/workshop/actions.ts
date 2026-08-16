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

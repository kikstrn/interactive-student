"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/login");
}

export async function createClass(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const name = String(formData.get("name") ?? "").trim();
    const grade = String(formData.get("grade") ?? "").trim();
    const schoolYear = String(formData.get("schoolYear") ?? "").trim();

    if (!name) {
        return;
    }

    const { error } = await supabase.from("classes").insert({
        teacher_id: user.id,
        name,
        grade: grade || null,
        school_year: schoolYear || null,
    });

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/dashboard");
}

export async function updateTutorialProgress(
    step: number
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return;
    }

    await supabase
        .from("profiles")
        .update({
            tutorial_step: Math.max(
                0,
                Math.min(step, 20)
            ),
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", user.id);
}

export async function completeTutorial() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return;
    }

    await supabase
        .from("profiles")
        .update({
            tutorial_completed: true,
            tutorial_skipped: false,
            tutorial_step: 0,
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", user.id);

    revalidatePath("/dashboard");
    revalidatePath("/settings");
}

export async function skipTutorial() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return;
    }

    await supabase
        .from("profiles")
        .update({
            tutorial_skipped: true,
            tutorial_step: 0,
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", user.id);

    revalidatePath("/dashboard");
    revalidatePath("/settings");
}

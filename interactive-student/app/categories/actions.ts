"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCategory(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const name = String(formData.get("name") ?? "").trim();
    const description = String(
        formData.get("description") ?? ""
    ).trim();

    const icon = String(formData.get("icon") ?? "📚");
    const inputType = String(
        formData.get("inputType") ?? "text"
    );

    if (!name) {
        return;
    }

    if (!["text", "numeric"].includes(inputType)) {
        return;
    }

    const { error } = await supabase
        .from("subjects")
        .insert({
            teacher_id: user.id,
            name,
            description: description || null,
            icon,
            input_type: inputType,
        });

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/categories");
}

export async function deleteCategory(categoryId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", categoryId);

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/categories");
}
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStudent(
    classId: string,
    formData: FormData
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const level = String(formData.get("level") ?? "beginner");

    if (!firstName) {
        return;
    }

    const { error } = await supabase.from("students").insert({
        class_id: classId,
        first_name: firstName,
        last_name: lastName || null,
        level,
    });

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath(`/classes/${classId}`);
    revalidatePath("/dashboard");
}

export async function updateStudentLevel(
    studentId: string,
    classId: string,
    level: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { error } = await supabase
        .from("students")
        .update({
            level,
            updated_at: new Date().toISOString(),
        })
        .eq("id", studentId);

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath(`/classes/${classId}`);
}

export async function deleteStudent(
    studentId: string,
    classId: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath(`/classes/${classId}`);
    revalidatePath("/dashboard");
}
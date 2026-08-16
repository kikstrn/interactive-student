"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedLevels = ["beginner", "intermediate", "advanced"];
const allowedTypes = ["question", "qcm", "oral", "challenge"];

export async function createExercise(
    categoryId: string,
    formData: FormData
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: category } = await supabase
        .from("subjects")
        .select("id")
        .eq("id", categoryId)
        .eq("teacher_id", user.id)
        .single();

    if (!category) {
        return;
    }

    const title = String(formData.get("title") ?? "").trim();
    const question = String(formData.get("question") ?? "").trim();
    const level = String(formData.get("level") ?? "beginner");
    const exerciseType = String(
        formData.get("exerciseType") ?? "question"
    );
    const shareToWorkshop =
        formData.get("shareToWorkshop") === "true";

    if (!question) {
        return;
    }

    if (!allowedLevels.includes(level)) {
        return;
    }

    if (!allowedTypes.includes(exerciseType)) {
        return;
    }

    let answer = String(formData.get("answer") ?? "").trim();
    let choices: string[] | null = null;

    if (exerciseType === "qcm") {
        choices = [
            String(formData.get("choice1") ?? "").trim(),
            String(formData.get("choice2") ?? "").trim(),
            String(formData.get("choice3") ?? "").trim(),
            String(formData.get("choice4") ?? "").trim(),
        ];

        if (choices.some((choice) => !choice)) {
            return;
        }

        const correctChoice = Number(
            formData.get("correctChoice")
        );

        if (
            !Number.isInteger(correctChoice) ||
            correctChoice < 0 ||
            correctChoice > 3
        ) {
            return;
        }

        answer = choices[correctChoice];
    }

    const { error } = await supabase
        .from("exercises")
        .insert({
            teacher_id: user.id,
            subject_id: categoryId,
            title: title || null,
            question,
            answer: answer || null,
            level,
            exercise_type: exerciseType,
            choices,
            active: true,
            share_to_workshop: shareToWorkshop,
        });

    if (error) {
        console.error("createExercise:", error);
        return;
    }

    revalidatePath(`/categories/${categoryId}`);
    revalidatePath("/categories");
    revalidatePath("/workshop");
    revalidatePath("/dashboard");
}

export async function deleteExercise(
    exerciseId: string,
    categoryId: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exerciseId)
        .eq("teacher_id", user.id);

    if (error) {
        console.error("deleteExercise:", error);
        return;
    }

    revalidatePath(`/categories/${categoryId}`);
    revalidatePath("/categories");
    revalidatePath("/workshop");
    revalidatePath("/dashboard");
}

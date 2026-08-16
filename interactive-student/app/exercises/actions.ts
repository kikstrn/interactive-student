"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExercise(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const title = String(formData.get("title") ?? "").trim();
    const question = String(formData.get("question") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const level = String(formData.get("level") ?? "beginner");
    const exerciseType = String(
        formData.get("exerciseType") ?? "question"
    );
    const shareToWorkshop =
        formData.get("shareToWorkshop") === "on";

    if (!question) {
        return;
    }

    let answer = String(
        formData.get("answer") ?? ""
    ).trim();

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
            title: title || null,
            question,
            answer: answer || null,
            category: category || null,
            level,
            exercise_type: exerciseType,
            choices,
            active: true,
            share_to_workshop: shareToWorkshop,
        });

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/exercises");
    revalidatePath("/dashboard");
}

export async function deleteExercise(exerciseId: string) {
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
        .eq("id", exerciseId);

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/exercises");
    revalidatePath("/dashboard");
}
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type RecordAnswerInput = {
    classId: string;
    studentId: string;
    exerciseId: string;
    exerciseItemId?: string | null;
    itemPosition: number;
    exerciseTitle?: string | null;
    exerciseType: string;
    categoryName?: string | null;
    categoryIcon?: string | null;
    prompt: string;
    studentAnswer?: string | null;
    expectedAnswer?: string | null;
    isCorrect: boolean;
};

export async function recordStudentAnswer(
    input: RecordAnswerInput
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            reason: "unauthenticated",
        };
    }

    // Vérifie que l'élève appartient bien à une classe du professeur connecté.
    const { data: student } = await supabase
        .from("students")
        .select(`
            id,
            class_id,
            classes!inner (
                id,
                teacher_id
            )
        `)
        .eq("id", input.studentId)
        .eq("class_id", input.classId)
        .eq("classes.teacher_id", user.id)
        .single();

    if (!student) {
        return {
            success: false,
            reason: "forbidden",
        };
    }

    // Vérifie aussi que l'exercice appartient au professeur.
    const { data: exercise } = await supabase
        .from("exercises")
        .select("id")
        .eq("id", input.exerciseId)
        .eq("teacher_id", user.id)
        .single();

    if (!exercise) {
        return {
            success: false,
            reason: "exercise_not_found",
        };
    }

    const { error } = await supabase
        .from("student_exercise_results")
        .insert({
            teacher_id: user.id,
            class_id: input.classId,
            student_id: input.studentId,
            exercise_id: input.exerciseId,
            exercise_item_id:
                input.exerciseItemId || null,
            item_position: input.itemPosition,
            exercise_title:
                input.exerciseTitle || null,
            exercise_type: input.exerciseType,
            category_name:
                input.categoryName || null,
            category_icon:
                input.categoryIcon || null,
            prompt_snapshot: input.prompt,
            student_answer:
                input.studentAnswer || null,
            expected_answer:
                input.expectedAnswer || null,
            is_correct: input.isCorrect,
        });

    if (error) {
        console.error(
            "recordStudentAnswer:",
            error
        );

        return {
            success: false,
            reason: "insert_error",
        };
    }

    revalidatePath(
        `/classes/${input.classId}/students/${input.studentId}/progress`
    );
    revalidatePath(
        `/classes/${input.classId}`
    );

    return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedLevels = [
    "beginner",
    "intermediate",
    "advanced",
];

const allowedTypes = [
    "question",
    "qcm",
    "voice",
    "image",
    "oral",
    "challenge",
];

type ParsedItem = {
    prompt: string;
    answer: string;
    speechText: string;
    speechMode: "synthetic" | "recorded";
    audioUrl: string;
    imageUrl: string;
    imageAlt: string;
    choices: string[];
    correctChoice: number;
};

function parseItems(
    formData: FormData,
    exerciseType: string
): ParsedItem[] | null {
    let raw: unknown;

    try {
        raw = JSON.parse(
            String(formData.get("itemsJson") ?? "[]")
        );
    } catch {
        return null;
    }

    if (!Array.isArray(raw) || raw.length === 0) {
        return null;
    }

    const items: ParsedItem[] = raw.map(
        (value) => {
            const record =
                value && typeof value === "object"
                    ? (value as Record<string, unknown>)
                    : {};

            return {
                prompt: String(
                    record.prompt ?? ""
                ).trim(),
                answer: String(
                    record.answer ?? ""
                ).trim(),
                speechText: String(
                    record.speechText ?? ""
                ).trim(),
                speechMode: record.speechMode === "recorded" ? "recorded" : "synthetic",
                audioUrl: String(record.audioUrl ?? "").trim(),
                imageUrl: String(record.imageUrl ?? "").trim(),
                imageAlt: String(record.imageAlt ?? "").trim(),
                choices: Array.isArray(
                    record.choices
                )
                    ? record.choices.map((choice) =>
                          String(choice).trim()
                      )
                    : [],
                correctChoice: Number(
                    record.correctChoice ?? 0
                ),
            };
        }
    );

    if (
        exerciseType !== "question" &&
        exerciseType !== "voice" &&
        exerciseType !== "image" &&
        items.length > 1
    ) {
        items.splice(1);
    }

    for (const item of items) {
        if (exerciseType === "voice") {
            if (!item.answer) {
                return null;
            }

            if (item.speechMode === "recorded") {
                if (!item.audioUrl) return null;
                item.prompt = item.speechText || "Écoute l'enregistrement";
            } else {
                if (!item.speechText) return null;
                item.prompt = item.speechText;
            }
        } else if (exerciseType === "image") {
            if (!item.imageUrl || !item.prompt || !item.answer) {
                return null;
            }
        } else if (exerciseType === "qcm") {
            if (
                !item.prompt ||
                item.choices.length !== 4 ||
                item.choices.some(
                    (choice) => !choice
                ) ||
                !Number.isInteger(
                    item.correctChoice
                ) ||
                item.correctChoice < 0 ||
                item.correctChoice > 3
            ) {
                return null;
            }

            item.answer =
                item.choices[
                    item.correctChoice
                ] ?? "";

            if (!item.answer) {
                return null;
            }
        } else if (
            exerciseType === "question"
        ) {
            if (!item.prompt || !item.answer) {
                return null;
            }
        } else if (!item.prompt) {
            return null;
        }
    }

    return items;
}

async function requireOwnedCategory(
    categoryId: string
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
        return null;
    }

    return { supabase, user };
}

function commonFormValues(formData: FormData) {
    const title = String(
        formData.get("title") ?? ""
    ).trim();

    const level = String(
        formData.get("level") ?? "beginner"
    );

    const exerciseType = String(
        formData.get("exerciseType") ??
            "question"
    );

    const shareToWorkshop =
        formData.get("shareToWorkshop") ===
        "true";

    return {
        title,
        level,
        exerciseType,
        shareToWorkshop,
    };
}

function revalidateExercisePages(
    categoryId: string
) {
    revalidatePath(
        `/categories/${categoryId}`
    );
    revalidatePath("/categories");
    revalidatePath("/workshop");
    revalidatePath("/dashboard");
}

export async function createExercise(
    categoryId: string,
    formData: FormData
) {
    const auth =
        await requireOwnedCategory(categoryId);

    if (!auth) return;

    const { supabase, user } = auth;

    const {
        title,
        level,
        exerciseType,
        shareToWorkshop,
    } = commonFormValues(formData);

    if (!allowedLevels.includes(level)) {
        return;
    }

    if (!allowedTypes.includes(exerciseType)) {
        return;
    }

    const items = parseItems(
        formData,
        exerciseType
    );

    if (!items) {
        return;
    }

    const first = items[0];

    const { data: exercise, error } =
        await supabase
            .from("exercises")
            .insert({
                teacher_id: user.id,
                subject_id: categoryId,
                title: title || null,
                question: first.prompt,
                answer:
                    first.answer || null,
                level,
                exercise_type:
                    exerciseType,
                choices:
                    exerciseType === "qcm"
                        ? first.choices
                        : null,
                active: true,
                share_to_workshop:
                    shareToWorkshop,
            })
            .select("id")
            .single();

    if (error || !exercise) {
        console.error(
            "createExercise:",
            error
        );
        return;
    }

    const { error: itemsError } =
        await supabase
            .from("exercise_items")
            .insert(
                items.map((item, index) => ({
                    exercise_id: exercise.id,
                    position: index,
                    prompt: item.prompt,
                    answer:
                        item.answer || null,
                    speech_text:
                        exerciseType === "voice" ? item.speechText : null,
                    speech_mode:
                        exerciseType === "voice" ? item.speechMode : null,
                    audio_url:
                        exerciseType === "voice" ? item.audioUrl || null : null,
                    image_url:
                        exerciseType === "image" ? item.imageUrl || null : null,
                    image_alt:
                        exerciseType === "image" ? item.imageAlt || null : null,
                    choices:
                        exerciseType ===
                        "qcm"
                            ? item.choices
                            : null,
                }))
            );

    if (itemsError) {
        console.error(
            "createExercise items:",
            itemsError
        );

        await supabase
            .from("exercises")
            .delete()
            .eq("id", exercise.id)
            .eq("teacher_id", user.id);

        return;
    }

    revalidateExercisePages(categoryId);
}

export async function updateExercise(
    exerciseId: string,
    categoryId: string,
    formData: FormData
) {
    const auth =
        await requireOwnedCategory(categoryId);

    if (!auth) return;

    const { supabase, user } = auth;

    const { data: ownedExercise } =
        await supabase
            .from("exercises")
            .select("id")
            .eq("id", exerciseId)
            .eq("teacher_id", user.id)
            .eq("subject_id", categoryId)
            .single();

    if (!ownedExercise) {
        return;
    }

    const {
        title,
        level,
        exerciseType,
        shareToWorkshop,
    } = commonFormValues(formData);

    if (
        !allowedLevels.includes(level) ||
        !allowedTypes.includes(exerciseType)
    ) {
        return;
    }

    const items = parseItems(
        formData,
        exerciseType
    );

    if (!items) {
        return;
    }

    const first = items[0];

    const { error } = await supabase
        .from("exercises")
        .update({
            title: title || null,
            question: first.prompt,
            answer: first.answer || null,
            level,
            exercise_type: exerciseType,
            choices:
                exerciseType === "qcm"
                    ? first.choices
                    : null,
            share_to_workshop:
                shareToWorkshop,
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", exerciseId)
        .eq("teacher_id", user.id);

    if (error) {
        console.error(
            "updateExercise:",
            error
        );
        return;
    }

    const { error: deleteItemsError } =
        await supabase
            .from("exercise_items")
            .delete()
            .eq("exercise_id", exerciseId);

    if (deleteItemsError) {
        console.error(
            "updateExercise delete items:",
            deleteItemsError
        );
        return;
    }

    const { error: insertItemsError } =
        await supabase
            .from("exercise_items")
            .insert(
                items.map((item, index) => ({
                    exercise_id: exerciseId,
                    position: index,
                    prompt: item.prompt,
                    answer:
                        item.answer || null,
                    speech_text:
                        exerciseType === "voice" ? item.speechText : null,
                    speech_mode:
                        exerciseType === "voice" ? item.speechMode : null,
                    audio_url:
                        exerciseType === "voice" ? item.audioUrl || null : null,
                    image_url:
                        exerciseType === "image" ? item.imageUrl || null : null,
                    image_alt:
                        exerciseType === "image" ? item.imageAlt || null : null,
                    choices:
                        exerciseType ===
                        "qcm"
                            ? item.choices
                            : null,
                }))
            );

    if (insertItemsError) {
        console.error(
            "updateExercise insert items:",
            insertItemsError
        );
        return;
    }

    revalidateExercisePages(categoryId);
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

    // Retirer d'abord la publication Workshop d'origine.
    // Les exercices téléchargés par d'autres professeurs restent dans
    // leur bibliothèque : seule la publication source est supprimée.
    const { error: workshopError } =
        await supabase
            .from("workshop_exercises")
            .delete()
            .eq(
                "original_exercise_id",
                exerciseId
            )
            .eq("author_id", user.id);

    if (workshopError) {
        console.error(
            "deleteExercise workshop:",
            workshopError
        );
        return;
    }

    // exercise_items est supprimé automatiquement grâce au ON DELETE CASCADE.
    const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exerciseId)
        .eq("teacher_id", user.id);

    if (error) {
        console.error(
            "deleteExercise:",
            error
        );
        return;
    }

    revalidateExercisePages(categoryId);
}

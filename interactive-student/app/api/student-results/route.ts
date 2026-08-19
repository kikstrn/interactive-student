import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function POST(
    request: Request
) {
    const supabase =
        await createClient();

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                reason:
                    "unauthenticated",
            },
            {
                status: 401,
            }
        );
    }

    let input: RecordAnswerInput;

    try {
        input =
            (await request.json()) as RecordAnswerInput;
    } catch {
        return NextResponse.json(
            {
                success: false,
                reason:
                    "invalid_json",
            },
            {
                status: 400,
            }
        );
    }

    if (
        !input.classId ||
        !input.studentId ||
        !input.exerciseId ||
        !input.exerciseType ||
        !input.prompt ||
        typeof input.itemPosition !==
            "number" ||
        typeof input.isCorrect !==
            "boolean"
    ) {
        return NextResponse.json(
            {
                success: false,
                reason:
                    "invalid_input",
            },
            {
                status: 400,
            }
        );
    }

    const {
        data: student,
        error: studentError,
    } =
        await supabase
            .from("students")
            .select(`
                id,
                class_id,
                classes!inner (
                    id,
                    teacher_id
                )
            `)
            .eq(
                "id",
                input.studentId
            )
            .eq(
                "class_id",
                input.classId
            )
            .eq(
                "classes.teacher_id",
                user.id
            )
            .single();

    if (
        studentError ||
        !student
    ) {
        return NextResponse.json(
            {
                success: false,
                reason:
                    "forbidden",
            },
            {
                status: 403,
            }
        );
    }

    const {
        data: exercise,
        error: exerciseError,
    } =
        await supabase
            .from("exercises")
            .select("id")
            .eq(
                "id",
                input.exerciseId
            )
            .eq(
                "teacher_id",
                user.id
            )
            .single();

    if (
        exerciseError ||
        !exercise
    ) {
        return NextResponse.json(
            {
                success: false,
                reason:
                    "exercise_not_found",
            },
            {
                status: 404,
            }
        );
    }

    const { error } =
        await supabase
            .from(
                "student_exercise_results"
            )
            .insert({
                teacher_id:
                    user.id,
                class_id:
                    input.classId,
                student_id:
                    input.studentId,
                exercise_id:
                    input.exerciseId,
                exercise_item_id:
                    input.exerciseItemId ||
                    null,
                item_position:
                    input.itemPosition,
                exercise_title:
                    input.exerciseTitle ||
                    null,
                exercise_type:
                    input.exerciseType,
                category_name:
                    input.categoryName ||
                    null,
                category_icon:
                    input.categoryIcon ||
                    null,
                prompt_snapshot:
                    input.prompt,
                student_answer:
                    input.studentAnswer ||
                    null,
                expected_answer:
                    input.expectedAnswer ||
                    null,
                is_correct:
                    input.isCorrect,
            });

    if (error) {
        console.error(
            "POST /api/student-results:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                reason:
                    "insert_error",
            },
            {
                status: 500,
            }
        );
    }

    /*
     * Aucun revalidatePath ici.
     * C'est volontaire : l'enregistrement d'une réponse ne doit JAMAIS
     * provoquer un nouveau rendu du Mode Classe.
     */
    return NextResponse.json({
        success: true,
    });
}

import Link from "next/link";
import {
    notFound,
    redirect,
} from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExercisePlayer from "./exercise-player";

type StudentExercisePageProps = {
    params: Promise<{
        id: string;
        studentId: string;
    }>;
    searchParams: Promise<{
        new?: string;
    }>;
};

const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
};

export default async function StudentExercisePage({
    params,
    searchParams,
}: StudentExercisePageProps) {
    const { id, studentId } = await params;
    const query = await searchParams;
    const attemptKey =
        query.new ?? "initial";

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: student } = await supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            level,
            avatar,
            class_id
        `)
        .eq("id", studentId)
        .eq("class_id", id)
        .single();

    if (!student) {
        notFound();
    }

    const { data: exercises } = await supabase
        .from("exercises")
        .select(`
            id,
            title,
            question,
            answer,
            level,
            exercise_type,
            choices,
            subject_id,
            exercise_items (
                id,
                position,
                prompt,
                answer,
                speech_text,
                choices
            ),
            subjects (
                id,
                name,
                icon,
                input_type
            )
        `)
        .eq("teacher_id", user.id)
        .eq("level", student.level)
        .eq("active", true)
        .not("subject_id", "is", null);

    /*
     * Sélection adaptative KLIKAO
     * --------------------------
     * 1. On regarde les résultats récents de l'élève.
     * 2. Une matière avec au moins 3 réponses et moins de 60 % de réussite
     *    devient une priorité.
     * 3. On favorise les exercices de cette matière sans supprimer
     *    complètement la variété.
     * 4. On évite, si possible, de reproposer immédiatement le même exercice.
     */

    const { data: recentResults } =
        await supabase
            .from("student_exercise_results")
            .select(`
                exercise_id,
                category_name,
                is_correct,
                created_at
            `)
            .eq("teacher_id", user.id)
            .eq("student_id", student.id)
            .eq("class_id", id)
            .order("created_at", {
                ascending: false,
            })
            .limit(40);

    const categoryPerformance = new Map<
        string,
        {
            total: number;
            correct: number;
        }
    >();

    for (const result of recentResults ?? []) {
        const categoryName =
            result.category_name ?? "";

        if (!categoryName) {
            continue;
        }

        const current =
            categoryPerformance.get(
                categoryName
            ) ?? {
                total: 0,
                correct: 0,
            };

        current.total += 1;

        if (result.is_correct) {
            current.correct += 1;
        }

        categoryPerformance.set(
            categoryName,
            current
        );
    }

    const priorityCategories =
        Array.from(
            categoryPerformance.entries()
        )
            .map(([name, stat]) => ({
                name,
                total: stat.total,
                rate:
                    stat.total > 0
                        ? Math.round(
                            (stat.correct /
                                stat.total) *
                            100
                        )
                        : 100,
            }))
            .filter(
                (category) =>
                    category.total >= 3 &&
                    category.rate < 60
            )
            .sort(
                (a, b) =>
                    a.rate - b.rate
            );

    const lastExerciseId =
        recentResults?.[0]?.exercise_id ??
        null;

    type ExerciseCandidate = NonNullable<typeof exercises>[number];

    function exerciseSubjectName(
        candidate: ExerciseCandidate
    ) {
        const candidateSubject =
            Array.isArray(candidate.subjects)
                ? candidate.subjects[0]
                : candidate.subjects;

        return candidateSubject?.name ?? "";
    }

    let exercise =
        exercises && exercises.length > 0
            ? exercises[
            Math.floor(
                Math.random() *
                exercises.length
            )
            ]
            : null;

    if (exercises && exercises.length > 0) {
        const priorityNames = new Set(
            priorityCategories.map(
                (category) => category.name
            )
        );

        const priorityExercises =
            exercises.filter((candidate) =>
                priorityNames.has(
                    exerciseSubjectName(
                        candidate
                    )
                )
            );

        /*
         * 75 % de chance de travailler une difficulté détectée,
         * 25 % de chance de conserver de la variété.
         */
        const shouldUsePriority =
            priorityExercises.length > 0 &&
            Math.random() < 0.75;

        const candidatePool =
            shouldUsePriority
                ? priorityExercises
                : exercises;

        const withoutImmediateRepeat =
            candidatePool.filter(
                (candidate) =>
                    candidate.id !==
                    lastExerciseId
            );

        const finalPool =
            withoutImmediateRepeat.length >
                0
                ? withoutImmediateRepeat
                : candidatePool;

        exercise =
            finalPool[
            Math.floor(
                Math.random() *
                finalPool.length
            )
            ] ?? null;
    }

    const adaptiveCategory =
        exercise
            ? priorityCategories.find(
                (category) =>
                    category.name ===
                    exerciseSubjectName(
                        exercise
                    )
            ) ?? null
            : null;

    const subject = exercise
        ? Array.isArray(exercise.subjects)
            ? exercise.subjects[0]
            : exercise.subjects
        : null;

    const items =
        exercise &&
            Array.isArray(
                exercise.exercise_items
            )
            ? [...exercise.exercise_items].sort(
                (a, b) =>
                    a.position - b.position
            )
            : [];

    return (
        <main className="min-h-screen select-none bg-slate-950 text-white">
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-8 lg:px-10">
                <Link
                    href={`/classes/${id}/play`}
                    className="flex min-h-16 min-w-40 cursor-pointer items-center justify-center rounded-2xl bg-white/10 px-6 text-lg font-bold text-white transition hover:bg-white/20 active:scale-95"
                >
                    ← Retour
                </Link>

                <div className="rounded-2xl bg-white/10 px-6 py-3 text-right">
                    <p className="text-sm font-medium text-slate-400">
                        Niveau
                    </p>
                    <p className="text-lg font-bold">
                        {
                            levelLabels[
                            student.level
                            ]
                        }
                    </p>
                </div>
            </header>

            <section className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-10 pt-6 text-center sm:px-8 lg:px-10">
                <div className="flex items-center gap-5 rounded-3xl bg-white/5 px-7 py-5">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-5xl shadow-lg sm:h-28 sm:w-28 sm:text-6xl">
                        {student.avatar ?? "🙂"}
                    </div>

                    <div className="text-left">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                            C&apos;est au tour de
                        </p>
                        <h1 className="mt-1 text-3xl font-black sm:text-4xl lg:text-5xl">
                            {student.first_name}
                        </h1>
                    </div>
                </div>

                {!exercise ? (
                    <div className="mt-8 w-full max-w-5xl rounded-[2rem] bg-white/10 p-8 sm:p-12 lg:p-14">
                        <div className="text-7xl">
                            📚
                        </div>
                        <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                            Aucun exercice
                            disponible
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                            Aucun exercice actif
                            ne correspond
                            actuellement au niveau
                            de{" "}
                            {student.first_name}.
                        </p>
                        <Link
                            href={`/classes/${id}/play`}
                            className="mx-auto mt-10 flex min-h-20 max-w-xl cursor-pointer items-center justify-center rounded-3xl bg-indigo-600 px-8 text-xl font-black text-white transition hover:bg-indigo-500 active:scale-95 sm:text-2xl"
                        >
                            Retour aux élèves
                        </Link>
                    </div>
                ) : (
                    <ExercisePlayer
                        key={`${exercise.id}-${attemptKey}`}
                        exercise={{
                            id: exercise.id,
                            title: exercise.title,
                            question:
                                exercise.question,
                            answer:
                                exercise.answer,
                            exercise_type:
                                exercise.exercise_type,
                            choices:
                                Array.isArray(
                                    exercise.choices
                                )
                                    ? exercise.choices
                                    : null,
                            category_name:
                                subject?.name ??
                                null,
                            category_icon:
                                subject?.icon ??
                                null,
                            items,
                        }}
                        inputType={
                            subject?.input_type ===
                                "numeric"
                                ? "numeric"
                                : "text"
                        }
                        classId={id}
                        studentId={student.id}
                        adaptiveHint={
                            adaptiveCategory
                                ? {
                                    active: true,
                                    categoryName:
                                        adaptiveCategory.name,
                                    successRate:
                                        adaptiveCategory.rate,
                                }
                                : null
                        }
                    />
                )}
            </section>
        </main>
    );
}

import Link from "next/link";
import {
    notFound,
    redirect,
} from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExerciseForm from "./exercise-form";
import DeleteExerciseButton from "./delete-exercise-button";

type CategoryPageProps = {
    params: Promise<{
        id: string;
    }>;
};

const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
};

const typeLabels: Record<string, string> = {
    question: "Question",
    qcm: "QCM",
    voice: "🔊 Écoute",
    image: "🖼️ Image",
    oral: "Oral",
    challenge: "Défi",
};

export default async function CategoryPage({
    params,
}: CategoryPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: category } = await supabase
        .from("subjects")
        .select(`
            id,
            name,
            description,
            icon,
            input_type
        `)
        .eq("id", id)
        .eq("teacher_id", user.id)
        .single();

    if (!category) {
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
            active,
            source_workshop_id,
            share_to_workshop,
            exercise_items (
                id,
                position,
                prompt,
                answer,
                speech_text,
                speech_mode,
                audio_url,
                image_url,
                image_alt,
                choices
            )
        `)
        .eq("subject_id", id)
        .eq("teacher_id", user.id)
        .order("created_at", {
            ascending: false,
        });

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
                    <Link
                        href="/categories"
                        className="cursor-pointer text-sm font-bold text-slate-500 hover:text-slate-900"
                    >
                        ← Catégories
                    </Link>

                    <Link
                        href="/workshop"
                        className="cursor-pointer rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
                    >
                        🌐 Workshop
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-5">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-sm">
                            {category.icon ?? "📚"}
                        </div>

                        <div>
                            <h1 className="text-3xl font-black text-slate-900">
                                {category.name}
                            </h1>

                            {category.description && (
                                <p className="mt-2 text-slate-500">
                                    {category.description}
                                </p>
                            )}

                            <p className="mt-3 text-sm font-semibold text-slate-500">
                                {category.input_type ===
                                "numeric"
                                    ? "🔢 Pavé numérique"
                                    : "⌨️ Clavier texte"}
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:max-w-md">
                        <ExerciseForm
                            categoryId={id}
                        />
                    </div>
                </div>

                <section className="mt-12">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900">
                            Exercices
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {exercises?.length ?? 0}{" "}
                            exercice
                            {(exercises?.length ?? 0) >
                            1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    {!exercises ||
                    exercises.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                            <div className="text-6xl">
                                ✏️
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-slate-800">
                                Aucun exercice
                            </h3>

                            <p className="mt-2 text-slate-500">
                                Ajoutez votre premier
                                exercice dans cette
                                catégorie.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {exercises.map(
                                (exercise) => {
                                    const exerciseItems =
                                        Array.isArray(
                                            exercise.exercise_items
                                        )
                                            ? [
                                                  ...exercise.exercise_items,
                                              ].sort(
                                                  (
                                                      a,
                                                      b
                                                  ) =>
                                                      a.position -
                                                      b.position
                                              )
                                            : [];

                                    const itemCount =
                                        exerciseItems.length >
                                        0
                                            ? exerciseItems.length
                                            : 1;

                                    return (
                                        <article
                                            key={
                                                exercise.id
                                            }
                                            className="rounded-3xl bg-white p-6 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                                            {
                                                                levelLabels[
                                                                    exercise
                                                                        .level
                                                                ]
                                                            }
                                                        </span>

                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                                            {typeLabels[
                                                                exercise
                                                                    .exercise_type
                                                            ] ??
                                                                exercise.exercise_type}
                                                        </span>

                                                        {(exercise.exercise_type ===
                                                            "question" ||
                                                            exercise.exercise_type ===
                                                                "voice") &&
                                                            itemCount >
                                                                1 && (
                                                                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                                                                    {
                                                                        itemCount
                                                                    }{" "}
                                                                    étapes
                                                                </span>
                                                            )}

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                                exercise.source_workshop_id
                                                                    ? "bg-sky-50 text-sky-700"
                                                                    : exercise.share_to_workshop
                                                                      ? "bg-teal-50 text-teal-700"
                                                                      : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            {exercise.source_workshop_id
                                                                ? "📥 Workshop"
                                                                : exercise.share_to_workshop
                                                                  ? "🌐 Public"
                                                                  : "🔒 Privé"}
                                                        </span>
                                                    </div>

                                                    <h3 className="mt-4 text-xl font-black text-slate-900">
                                                        {exercise.title ??
                                                            "Exercice"}
                                                    </h3>
                                                </div>
                                            </div>

                                            {exercise.exercise_type ===
                                            "voice" ? (
                                                <div className="mt-4 rounded-2xl bg-indigo-50 p-4">
                                                    <p className="font-black text-indigo-800">
                                                        🔊 Exercice
                                                        d&apos;écoute
                                                    </p>
                                                    <p className="mt-1 text-sm text-indigo-600">
                                                        Le contenu est lu
                                                        à voix haute à
                                                        l&apos;élève.
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-700">
                                                    {
                                                        exercise.question
                                                    }
                                                </p>
                                            )}

                                            {itemCount > 1 && (
                                                <div className="mt-4 space-y-2">
                                                    {exerciseItems
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"
                                                                >
                                                                    <span className="font-black text-slate-800">
                                                                        {index +
                                                                            1}
                                                                        .
                                                                    </span>{" "}
                                                                    {exercise.exercise_type ===
                                                                    "voice"
                                                                        ? "🔊 Contenu vocal"
                                                                        : item.prompt}
                                                                </div>
                                                            )
                                                        )}

                                                    {itemCount >
                                                        3 && (
                                                        <p className="text-xs font-bold text-slate-400">
                                                            +
                                                            {itemCount -
                                                                3}{" "}
                                                            autre
                                                            {itemCount -
                                                                3 >
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                                                <ExerciseForm
                                                    categoryId={
                                                        id
                                                    }
                                                    exercise={{
                                                        id: exercise.id,
                                                        title:
                                                            exercise.title,
                                                        level:
                                                            exercise.level,
                                                        exercise_type:
                                                            exercise.exercise_type,
                                                        share_to_workshop:
                                                            exercise.share_to_workshop ??
                                                            false,
                                                        question:
                                                            exercise.question,
                                                        answer:
                                                            exercise.answer,
                                                        choices:
                                                            Array.isArray(
                                                                exercise.choices
                                                            )
                                                                ? exercise.choices
                                                                : null,
                                                        exercise_items:
                                                            exerciseItems,
                                                    }}
                                                    compactTrigger
                                                />

                                                <DeleteExerciseButton
                                                    exerciseId={
                                                        exercise.id
                                                    }
                                                    categoryId={
                                                        id
                                                    }
                                                    exerciseTitle={
                                                        exercise.title
                                                    }
                                                />
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

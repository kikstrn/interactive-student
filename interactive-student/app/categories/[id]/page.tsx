import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExerciseForm from "./exercise-form";
import { deleteExercise } from "./actions";

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
            source_workshop_id
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
                        className="text-sm font-bold text-slate-500 hover:text-slate-900"
                    >
                        ← Catégories
                    </Link>

                    <Link
                        href="/workshop"
                        className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
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
                                {category.input_type === "numeric"
                                    ? "🔢 Pavé numérique"
                                    : "⌨️ Clavier texte"}
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:max-w-md">
                        <ExerciseForm categoryId={id} />
                    </div>
                </div>

                <section className="mt-12">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900">
                            Exercices
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {exercises?.length ?? 0} exercice
                            {(exercises?.length ?? 0) > 1 ? "s" : ""}
                        </p>
                    </div>

                    {!exercises || exercises.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                            <div className="text-6xl">✏️</div>

                            <h3 className="mt-5 text-xl font-bold text-slate-800">
                                Aucun exercice
                            </h3>

                            <p className="mt-2 text-slate-500">
                                Ajoutez votre premier exercice dans cette catégorie.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {exercises.map((exercise) => (
                                <article
                                    key={exercise.id}
                                    className="rounded-3xl bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                                    {levelLabels[exercise.level]}
                                                </span>

                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                                    {typeLabels[exercise.exercise_type]}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        exercise.source_workshop_id
                                                            ? "bg-sky-50 text-sky-700"
                                                            : "bg-emerald-50 text-emerald-700"
                                                    }`}
                                                >
                                                    {exercise.source_workshop_id
                                                        ? "📥 Workshop"
                                                        : "🌐 Partagé"}
                                                </span>
                                            </div>

                                            <h3 className="mt-4 text-xl font-black text-slate-900">
                                                {exercise.title ?? "Exercice"}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-700">
                                        {exercise.question}
                                    </p>

                                    {exercise.exercise_type === "qcm" &&
                                        Array.isArray(exercise.choices) && (
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {exercise.choices.map(
                                                    (choice: string, index: number) => (
                                                        <div
                                                            key={`${choice}-${index}`}
                                                            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                                                                choice === exercise.answer
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-slate-50 text-slate-600"
                                                            }`}
                                                        >
                                                            {choice}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}

                                    {exercise.answer && (
                                        <p className="mt-4 text-sm text-slate-500">
                                            Réponse :{" "}
                                            <span className="font-bold text-slate-800">
                                                {exercise.answer}
                                            </span>
                                        </p>
                                    )}

                                    <form
                                        action={async () => {
                                            "use server";
                                            await deleteExercise(exercise.id, id);
                                        }}
                                        className="mt-5"
                                    >
                                        <button
                                            type="submit"
                                            className="rounded-xl px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                        >
                                            Supprimer
                                        </button>
                                    </form>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

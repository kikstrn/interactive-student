import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExerciseForm from "./exercise-form";
import { deleteExercise } from "./actions";

const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
};

export default async function ExercisesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: exercises } = await supabase
        .from("exercises")
        .select(`
            id,
            title,
            question,
            answer,
            category,
            level,
            exercise_type,
            active,
            choices
        `)
        .order("created_at", {
            ascending: false,
        });

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-5">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                        ← Dashboard
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-slate-900">
                        Exercices
                    </h1>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Bibliothèque
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {exercises?.length ?? 0} exercice
                            {(exercises?.length ?? 0) > 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="w-full lg:max-w-md">
                        <ExerciseForm />
                    </div>
                </div>

                <section className="mt-10">
                    {!exercises || exercises.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <div className="text-5xl">📚</div>

                            <h3 className="mt-4 font-semibold text-slate-800">
                                Aucun exercice
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Ajoutez votre premier exercice.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {exercises.map((exercise) => (
                                <article
                                    key={exercise.id}
                                    className="rounded-2xl bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                {exercise.category ??
                                                    exercise.exercise_type}
                                            </p>

                                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                                {exercise.title ??
                                                    "Exercice"}
                                            </h3>
                                        </div>

                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            {levelLabels[exercise.level]}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-slate-700">
                                        {exercise.question}
                                    </p>

                                    {exercise.answer && (
                                        <p className="mt-3 text-sm text-slate-500">
                                            Réponse :{" "}
                                            <span className="font-semibold text-slate-700">
                                                {exercise.answer}
                                            </span>
                                        </p>
                                    )}

                                    <form
                                        action={async () => {
                                            "use server";
                                            await deleteExercise(
                                                exercise.id
                                            );
                                        }}
                                        className="mt-5"
                                    >
                                        <button
                                            type="submit"
                                            className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
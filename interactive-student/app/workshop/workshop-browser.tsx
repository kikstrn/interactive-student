"use client";

import { useMemo, useState } from "react";
import ImportButton from "./import-button";

type WorkshopExercise = {
    id: string;
    author_id: string;
    author_name: string | null;
    category_name: string;
    category_icon: string | null;
    input_type: string;
    title: string | null;
    question: string;
    level: string;
    exercise_type: string;
    choices: string[] | null;
    download_count: number;
    created_at: string;
};

type WorkshopBrowserProps = {
    exercises: WorkshopExercise[];
    currentUserId: string;
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

export default function WorkshopBrowser({
    exercises,
    currentUserId,
}: WorkshopBrowserProps) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [level, setLevel] = useState("all");
    const [type, setType] = useState("all");
    const [source, setSource] = useState("all");
    const [sort, setSort] = useState("popular");

    const categories = useMemo(
        () =>
            Array.from(
                new Set(
                    exercises.map(
                        (exercise) => exercise.category_name
                    )
                )
            ).sort((a, b) =>
                a.localeCompare(b, "fr")
            ),
        [exercises]
    );

    const filtered = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("fr");

        const result = exercises.filter((exercise) => {
            const matchesSearch =
                !normalizedSearch ||
                [
                    exercise.title ?? "",
                    exercise.question,
                    exercise.category_name,
                    exercise.author_name ?? "",
                ]
                    .join(" ")
                    .toLocaleLowerCase("fr")
                    .includes(normalizedSearch);

            const matchesCategory =
                category === "all" ||
                exercise.category_name === category;

            const matchesLevel =
                level === "all" ||
                exercise.level === level;

            const matchesType =
                type === "all" ||
                exercise.exercise_type === type;

            const matchesSource =
                source === "all" ||
                (source === "mine"
                    ? exercise.author_id === currentUserId
                    : exercise.author_id !== currentUserId);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLevel &&
                matchesType &&
                matchesSource
            );
        });

        return [...result].sort((a, b) => {
            if (sort === "recent") {
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            }

            if (sort === "alphabetical") {
                return (a.title ?? a.question).localeCompare(
                    b.title ?? b.question,
                    "fr"
                );
            }

            return b.download_count - a.download_count;
        });
    }, [
        exercises,
        search,
        category,
        level,
        type,
        source,
        sort,
        currentUserId,
    ]);

    return (
        <>
            <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                        🔎
                    </span>

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Rechercher une question, un titre, une catégorie..."
                        className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white"
                    />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                    >
                        <option value="all">
                            Toutes les catégories
                        </option>
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={level}
                        onChange={(event) =>
                            setLevel(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                    >
                        <option value="all">
                            Tous les niveaux
                        </option>
                        <option value="beginner">
                            Débutant
                        </option>
                        <option value="intermediate">
                            Intermédiaire
                        </option>
                        <option value="advanced">
                            Avancé
                        </option>
                    </select>

                    <select
                        value={type}
                        onChange={(event) =>
                            setType(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                    >
                        <option value="all">
                            Tous les types
                        </option>
                        <option value="question">
                            Question
                        </option>
                        <option value="qcm">
                            QCM
                        </option>
                        <option value="oral">
                            Oral
                        </option>
                        <option value="challenge">
                            Défi
                        </option>
                    </select>

                    <select
                        value={source}
                        onChange={(event) =>
                            setSource(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                    >
                        <option value="all">
                            Tous les professeurs
                        </option>
                        <option value="others">
                            Autres professeurs
                        </option>
                        <option value="mine">
                            Mes publications
                        </option>
                    </select>

                    <select
                        value={sort}
                        onChange={(event) =>
                            setSort(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                    >
                        <option value="popular">
                            Plus populaires
                        </option>
                        <option value="recent">
                            Plus récents
                        </option>
                        <option value="alphabetical">
                            A → Z
                        </option>
                    </select>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-slate-500">
                        {filtered.length} exercice
                        {filtered.length > 1 ? "s" : ""} trouvé
                        {filtered.length > 1 ? "s" : ""}
                    </p>

                    {(search ||
                        category !== "all" ||
                        level !== "all" ||
                        type !== "all" ||
                        source !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("all");
                                setLevel("all");
                                setType("all");
                                setSource("all");
                            }}
                            className="text-sm font-bold text-indigo-600"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="mt-8 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                    <div className="text-5xl">🔎</div>
                    <h2 className="mt-4 text-xl font-black text-slate-800">
                        Aucun exercice trouvé
                    </h2>
                    <p className="mt-2 text-slate-500">
                        Modifiez votre recherche ou vos filtres.
                    </p>
                </div>
            ) : (
                <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((exercise) => (
                        <article
                            key={exercise.id}
                            className="flex flex-col rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                                        {exercise.category_icon ??
                                            "📚"}
                                    </div>

                                    <div>
                                        <p className="font-black text-slate-900">
                                            {
                                                exercise.category_name
                                            }
                                        </p>
                                        <p className="text-xs font-semibold text-slate-400">
                                            {exercise.input_type ===
                                            "numeric"
                                                ? "🔢 Numérique"
                                                : "⌨️ Texte"}
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    📥{" "}
                                    {
                                        exercise.download_count
                                    }
                                </span>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                    {
                                        levelLabels[
                                            exercise.level
                                        ]
                                    }
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    {
                                        typeLabels[
                                            exercise
                                                .exercise_type
                                        ]
                                    }
                                </span>
                            </div>

                            <h2 className="mt-5 text-xl font-black text-slate-900">
                                {exercise.title ?? "Exercice"}
                            </h2>

                            <p className="mt-3 flex-1 text-base font-semibold leading-relaxed text-slate-700">
                                {exercise.question}
                            </p>

                            {exercise.exercise_type ===
                                "qcm" &&
                                Array.isArray(
                                    exercise.choices
                                ) && (
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        {exercise.choices.map(
                                            (
                                                choice,
                                                index
                                            ) => (
                                                <div
                                                    key={`${choice}-${index}`}
                                                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                                                >
                                                    {choice}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                            <div className="mt-5 border-t border-slate-100 pt-4">
                                <p className="mb-4 text-xs font-semibold text-slate-400">
                                    Par{" "}
                                    {exercise.author_name ||
                                        "un enseignant"}
                                </p>

                                {exercise.author_id ===
                                currentUserId ? (
                                    <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center text-sm font-bold text-emerald-700">
                                        ✓ Votre publication
                                    </div>
                                ) : (
                                    <ImportButton
                                        workshopId={
                                            exercise.id
                                        }
                                    />
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </>
    );
}

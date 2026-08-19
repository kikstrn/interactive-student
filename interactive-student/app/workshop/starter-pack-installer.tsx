"use client";

import { useState } from "react";
import { installOfficialGradePack } from "./actions";

type StarterPackInstallerProps = {
    counts?: Partial<Record<string, number>>;
    installedGrades?: string[];
};

const grades = [
    {
        value: "CP",
        label: "CP",
        icon: "🌱",
        description:
            "Premiers calculs, lecture, français, anglais et écoute.",
    },
    {
        value: "CE1",
        label: "CE1",
        icon: "✏️",
        description:
            "Calcul, français, conjugaison, lecture, sciences et écoute.",
    },
    {
        value: "CE2",
        label: "CE2",
        icon: "📘",
        description:
            "Maths, grammaire, conjugaison, histoire, géographie et écoute.",
    },
    {
        value: "CM1",
        label: "CM1",
        icon: "🧠",
        description:
            "Fractions, français, conjugaison, sciences, anglais et écoute.",
    },
    {
        value: "CM2",
        label: "CM2",
        icon: "🚀",
        description:
            "Décimaux, proportionnalité, grammaire, histoire, géographie et écoute.",
    },
] as const;

export default function StarterPackInstaller({
    counts = {},
    installedGrades = [],
}: StarterPackInstallerProps) {
    const [loadingGrade, setLoadingGrade] =
        useState<string | null>(null);

    const [messages, setMessages] =
        useState<Record<string, string>>(
            {}
        );

    const [
        locallyInstalledGrades,
        setLocallyInstalledGrades,
    ] = useState<Set<string>>(
        () =>
            new Set(
                installedGrades
            )
    );

    async function installPack(
        grade: string
    ) {
        if (loadingGrade) {
            return;
        }

        const confirmed = window.confirm(
            `Installer le pack ${grade} ?\n\nKLIKAO va créer automatiquement les catégories nécessaires et ajouter tous les exercices officiels ${grade} dans votre bibliothèque.`
        );

        if (!confirmed) {
            return;
        }

        setLoadingGrade(grade);

        setMessages((current) => ({
            ...current,
            [grade]: "",
        }));

        const result =
            await installOfficialGradePack(
                grade
            );

        setLoadingGrade(null);

        if (!result.success) {
            setMessages((current) => ({
                ...current,
                [grade]:
                    "Impossible d'installer ce pack.",
            }));
            return;
        }

        const imported =
            result.imported ?? 0;
        const already =
            result.alreadyImported ?? 0;

        const total =
            result.total ?? 0;

        if (
            total > 0 &&
            imported + already >= total
        ) {
            setLocallyInstalledGrades(
                (current) => {
                    const next =
                        new Set(
                            current
                        );
                    next.add(grade);
                    return next;
                }
            );
        }

        if (imported === 0 && already > 0) {
            setMessages((current) => ({
                ...current,
                [grade]:
                    "✓ Ce pack est déjà installé.",
            }));
            return;
        }

        setMessages((current) => ({
            ...current,
            [grade]:
                `✓ ${imported} exercice${imported > 1 ? "s" : ""} ajouté${imported > 1 ? "s" : ""}` +
                (already > 0
                    ? ` · ${already} déjà présent${already > 1 ? "s" : ""}`
                    : ""),
        }));
    }

    return (
        <section className="mt-8 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                            🎒
                        </div>

                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">
                                Démarrage rapide
                            </p>

                            <h2 className="text-2xl font-black text-slate-900">
                                Installer un pack de classe
                            </h2>
                        </div>
                    </div>

                    <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                        Choisissez votre niveau de classe. KLIKAO crée automatiquement
                        les catégories nécessaires et importe les exercices officiels
                        correspondants. Vous pourrez ensuite les modifier, en supprimer
                        ou en ajouter d&apos;autres depuis le Workshop.
                    </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
                    CP → CM2 · 3 niveaux de difficulté
                </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {grades.map((grade) => {
                    const count =
                        counts[grade.value] ?? 0;

                    const loading =
                        loadingGrade ===
                        grade.value;

                    const installed =
                        locallyInstalledGrades.has(
                            grade.value
                        );

                    return (
                        <article
                            key={grade.value}
                            className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                                    {grade.icon}
                                </div>

                                {count > 0 && (
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                                        ⭐ {count}
                                    </span>
                                )}
                            </div>

                            <h3 className="mt-4 text-2xl font-black text-slate-900">
                                {grade.label}
                            </h3>

                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                                {
                                    grade.description
                                }
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    installPack(
                                        grade.value
                                    )
                                }
                                disabled={
                                    Boolean(
                                        loadingGrade
                                    ) ||
                                    installed
                                }
                                className={`mt-5 min-h-12 w-full rounded-2xl px-4 font-black text-white transition ${
                                    installed
                                        ? "cursor-default bg-emerald-600 shadow-sm"
                                        : "cursor-pointer bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                }`}
                            >
                                {loading
                                    ? "Installation..."
                                    : installed
                                      ? `✓ Pack ${grade.label} installé`
                                      : `Installer le pack ${grade.label}`}
                            </button>

                            {messages[
                                grade.value
                            ] && (
                                <p className="mt-3 text-center text-xs font-bold leading-5 text-teal-700">
                                    {
                                        messages[
                                            grade
                                                .value
                                        ]
                                    }
                                </p>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

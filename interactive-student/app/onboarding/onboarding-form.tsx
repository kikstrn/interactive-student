"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";

const grades = [
    {
        value: "CP",
        icon: "🌱",
        description:
            "Premiers apprentissages",
    },
    {
        value: "CE1",
        icon: "✏️",
        description:
            "Consolider les bases",
    },
    {
        value: "CE2",
        icon: "📘",
        description:
            "Approfondir",
    },
    {
        value: "CM1",
        icon: "🧠",
        description:
            "Gagner en autonomie",
    },
    {
        value: "CM2",
        icon: "🚀",
        description:
            "Préparer la suite",
    },
] as const;

export default function OnboardingForm({
    firstName,
}: {
    firstName?: string | null;
}) {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [grade, setGrade] = useState("");
    const [className, setClassName] =
        useState("");
    const [schoolYear, setSchoolYear] =
        useState("2026-2027");
    const [installPack, setInstallPack] =
        useState(true);
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] =
        useState("");
    const [loading, setLoading] =
        useState(false);
    const [error, setError] = useState("");

    const progress = useMemo(
        () => (step / 3) * 100,
        [step]
    );

    function goNext() {
        setError("");

        if (step === 1) {
            if (!grade) {
                setError(
                    "Choisissez le niveau de votre classe."
                );
                return;
            }

            if (!className.trim()) {
                setError(
                    "Indiquez le nom de votre classe."
                );
                return;
            }
        }

        setStep((current) =>
            Math.min(3, current + 1)
        );
    }

    async function finish() {
        setError("");

        if (!/^\d{4}$/.test(pin)) {
            setError(
                "Le PIN doit contenir exactement 4 chiffres."
            );
            return;
        }

        if (pin !== confirmPin) {
            setError(
                "Les deux codes PIN ne correspondent pas."
            );
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.set("grade", grade);
        formData.set(
            "className",
            className.trim()
        );
        formData.set(
            "schoolYear",
            schoolYear.trim()
        );
        formData.set(
            "installPack",
            installPack
                ? "true"
                : "false"
        );
        formData.set("pin", pin);
        formData.set(
            "confirmPin",
            confirmPin
        );

        const result =
            await completeOnboarding(
                formData
            );

        if (!result.success) {
            setLoading(false);

            const messages: Record<
                string,
                string
            > = {
                invalid_grade:
                    "Le niveau choisi n'est pas valide.",
                missing_class_name:
                    "Le nom de la classe est obligatoire.",
                invalid_pin:
                    "Le PIN doit contenir exactement 4 chiffres.",
                pin_mismatch:
                    "Les deux codes PIN ne correspondent pas.",
                class_error:
                    "Impossible de créer la classe.",
                pin_error:
                    "Impossible d'enregistrer le PIN.",
                profile_error:
                    "Impossible de terminer la configuration du compte.",
            };

            setError(
                messages[
                    result.reason ?? ""
                ] ??
                    "Une erreur est survenue."
            );
            return;
        }

        router.replace(
            "/dashboard?welcome=1"
        );
        router.refresh();
    }

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-6 text-center">
                <div className="text-5xl">
                    👋
                </div>

                <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
                    Bienvenue
                    {firstName
                        ? ` ${firstName}`
                        : ""}{" "}
                    sur KLIKAO
                </h1>

                <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-500">
                    Quelques réglages suffisent
                    pour préparer votre espace
                    enseignant.
                </p>
            </div>

            <div className="overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>

            <div className="mt-3 flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                <span
                    className={
                        step >= 1
                            ? "text-indigo-600"
                            : ""
                    }
                >
                    Classe
                </span>
                <span
                    className={
                        step >= 2
                            ? "text-indigo-600"
                            : ""
                    }
                >
                    Pack
                </span>
                <span
                    className={
                        step >= 3
                            ? "text-indigo-600"
                            : ""
                    }
                >
                    Sécurité
                </span>
            </div>

            <div className="mt-7 rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-9">
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            1. Votre classe principale
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Ce choix permettra à
                            KLIKAO de vous proposer
                            du contenu adapté.
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-5">
                            {grades.map(
                                (item) => {
                                    const selected =
                                        grade ===
                                        item.value;

                                    return (
                                        <button
                                            key={
                                                item.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                setGrade(
                                                    item.value
                                                )
                                            }
                                            className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                                                selected
                                                    ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100"
                                                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50"
                                            }`}
                                        >
                                            <div className="text-3xl">
                                                {
                                                    item.icon
                                                }
                                            </div>
                                            <div className="mt-2 text-lg font-black text-slate-900">
                                                {
                                                    item.value
                                                }
                                            </div>
                                            <div className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                                {
                                                    item.description
                                                }
                                            </div>
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Nom de la classe
                                </label>

                                <input
                                    value={
                                        className
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setClassName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Ex : CE1 A"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Année scolaire
                                </label>

                                <input
                                    value={
                                        schoolYear
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSchoolYear(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="2026-2027"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            2. Pack de démarrage{" "}
                            {grade}
                        </h2>

                        <p className="mt-2 leading-7 text-slate-500">
                            KLIKAO peut installer
                            automatiquement les
                            catégories et exercices
                            officiels correspondant à
                            votre classe.
                        </p>

                        <div className="mt-7 grid gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setInstallPack(
                                        true
                                    )
                                }
                                className={`cursor-pointer rounded-3xl border p-6 text-left transition ${
                                    installPack
                                        ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className="text-4xl">
                                    🎒
                                </div>

                                <h3 className="mt-4 text-xl font-black text-slate-900">
                                    Installer le pack{" "}
                                    {grade}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Recommandé. Vous
                                    aurez immédiatement
                                    des exercices prêts
                                    à utiliser.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setInstallPack(
                                        false
                                    )
                                }
                                className={`cursor-pointer rounded-3xl border p-6 text-left transition ${
                                    !installPack
                                        ? "border-indigo-400 bg-indigo-50 ring-4 ring-indigo-100"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className="text-4xl">
                                    ✏️
                                </div>

                                <h3 className="mt-4 text-xl font-black text-slate-900">
                                    Partir de zéro
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Vous créerez vos
                                    catégories et vos
                                    exercices vous-même.
                                </p>
                            </button>
                        </div>

                        <div className="mt-6 rounded-2xl bg-indigo-50 p-5 text-sm leading-6 text-indigo-800">
                            💡 Dans les deux cas, vous
                            pourrez toujours utiliser
                            le Workshop plus tard.
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            3. Sécuriser le Mode Classe
                        </h2>

                        <p className="mt-2 leading-7 text-slate-500">
                            Choisissez un PIN à 4
                            chiffres. Il sera demandé
                            pour quitter le Mode Classe
                            sur le tableau interactif.
                        </p>

                        <div className="mt-7 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Code PIN
                                </label>

                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(
                                        event
                                    ) =>
                                        setPin(
                                            event
                                                .target
                                                .value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-3xl font-black tracking-[0.35em] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Confirmer le PIN
                                </label>

                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={
                                        confirmPin
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setConfirmPin(
                                            event
                                                .target
                                                .value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-3xl font-black tracking-[0.35em] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-800">
                            🔐 Gardez ce code pour
                            l&apos;enseignant. Les élèves
                            ne doivent pas le connaître.
                        </div>
                    </div>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setStep(
                                    (current) =>
                                        current -
                                        1
                                );
                            }}
                            disabled={loading}
                            className="min-h-12 cursor-pointer rounded-2xl border border-slate-200 px-6 font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            ← Précédent
                        </button>
                    ) : (
                        <span />
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="min-h-12 cursor-pointer rounded-2xl bg-indigo-600 px-7 font-black text-white transition hover:bg-indigo-500"
                        >
                            Suivant →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={finish}
                            disabled={loading}
                            className="min-h-12 cursor-pointer rounded-2xl bg-indigo-600 px-7 font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Préparation de KLIKAO..."
                                : "Terminer et découvrir KLIKAO 🎉"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

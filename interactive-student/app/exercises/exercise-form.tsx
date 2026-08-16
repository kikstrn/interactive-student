"use client";

import { useState } from "react";
import { createExercise } from "./actions";

export default function ExerciseForm() {
    const [open, setOpen] = useState(false);
    const [exerciseType, setExerciseType] = useState("question");
    const [correctChoice, setCorrectChoice] = useState("0");
    const [shareToWorkshop, setShareToWorkshop] = useState(true);

    async function handleSubmit(formData: FormData) {
        await createExercise(formData);

        setOpen(false);
        setExerciseType("question");
        setCorrectChoice("0");
        setShareToWorkshop(true);
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 active:scale-95"
            >
                + Ajouter un exercice
            </button>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Nouvel exercice
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Créez un exercice pour vos élèves.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                    Fermer
                </button>
            </div>

            <form action={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Titre
                    </label>

                    <input
                        name="title"
                        placeholder="Ex : Multiplication"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Catégorie
                    </label>

                    <input
                        name="category"
                        placeholder="Ex : Mathématiques"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Niveau
                    </label>

                    <select
                        name="level"
                        defaultValue="beginner"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                    >
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
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Type d&apos;exercice
                    </label>

                    <select
                        name="exerciseType"
                        value={exerciseType}
                        onChange={(event) =>
                            setExerciseType(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                    >
                        <option value="question">
                            Question
                        </option>

                        <option value="oral">
                            Oral
                        </option>

                        <option value="challenge">
                            Défi
                        </option>

                        <option value="qcm">
                            QCM
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Question
                    </label>

                    <textarea
                        name="question"
                        placeholder="Ex : Combien font 7 × 8 ?"
                        required
                        rows={4}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                {exerciseType === "qcm" ? (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                        <div className="mb-5">
                            <h3 className="font-bold text-slate-900">
                                Choix du QCM
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Ajoutez les 4 réponses et sélectionnez
                                la bonne réponse.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {[0, 1, 2, 3].map((index) => (
                                <label
                                    key={index}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                        correctChoice === String(index)
                                            ? "border-emerald-400 bg-emerald-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="correctChoice"
                                        value={index}
                                        checked={
                                            correctChoice ===
                                            String(index)
                                        }
                                        onChange={() =>
                                            setCorrectChoice(
                                                String(index)
                                            )
                                        }
                                        className="h-5 w-5 accent-emerald-600"
                                    />

                                    <input
                                        type="text"
                                        name={`choice${index + 1}`}
                                        required
                                        placeholder={`Réponse ${
                                            index + 1
                                        }`}
                                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-slate-900 placeholder:text-slate-400 outline-none"
                                    />

                                    {correctChoice === String(index) && (
                                        <span className="hidden whitespace-nowrap text-xs font-bold text-emerald-700 sm:block">
                                            ✓ Bonne réponse
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Réponse attendue
                        </label>

                        <input
                            name="answer"
                            placeholder="Ex : 56"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                        />
                    </div>
                )}


                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-5">
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900">
                                Visibilité de l&apos;exercice
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                {shareToWorkshop
                                    ? "Cet exercice sera publié dans le Workshop et pourra être utilisé par les autres professeurs."
                                    : "Cet exercice restera privé et sera uniquement disponible dans votre espace."}
                            </p>
                        </div>

                        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                            <input
                                type="checkbox"
                                name="shareToWorkshop"
                                checked={shareToWorkshop}
                                onChange={(event) =>
                                    setShareToWorkshop(event.target.checked)
                                }
                                className="peer sr-only"
                            />

                            <span className="h-9 w-16 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600" />

                            <span className="absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-7" />
                        </label>
                    </div>

                    <div className="mt-4">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ${
                                shareToWorkshop
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-200 text-slate-700"
                            }`}
                        >
                            {shareToWorkshop
                                ? "🌐 Public — Workshop"
                                : "🔒 Privé"}
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
                >
                    Enregistrer l&apos;exercice
                </button>
            </form>
        </div>
    );
}
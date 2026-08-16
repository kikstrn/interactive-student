"use client";

import { useState } from "react";
import { createExercise } from "./actions";

type ExerciseFormProps = {
    categoryId: string;
};

export default function ExerciseForm({
    categoryId,
}: ExerciseFormProps) {
    const [open, setOpen] = useState(false);
    const [exerciseType, setExerciseType] = useState("question");
    const [correctChoice, setCorrectChoice] = useState("0");
    const [shareToWorkshop, setShareToWorkshop] = useState(true);

    async function handleSubmit(formData: FormData) {
        await createExercise(categoryId, formData);

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
                className="rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-500 active:scale-95"
            >
                + Ajouter un exercice
            </button>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        Nouvel exercice
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Créez l&apos;exercice dans cette catégorie et choisissez
                        s&apos;il doit être partagé avec les autres enseignants.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                    Fermer
                </button>
            </div>

            <form action={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Titre
                    </label>

                    <input
                        name="title"
                        placeholder="Ex : Tables de multiplication"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Niveau
                    </label>

                    <select
                        name="level"
                        defaultValue="beginner"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                    >
                        <option value="beginner">Débutant</option>
                        <option value="intermediate">Intermédiaire</option>
                        <option value="advanced">Avancé</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
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
                        <option value="question">Question</option>
                        <option value="qcm">QCM</option>
                        <option value="oral">Oral</option>
                        <option value="challenge">Défi</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Question
                    </label>

                    <textarea
                        name="question"
                        required
                        rows={4}
                        placeholder="Écrivez la question..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                {exerciseType === "qcm" ? (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                        <h3 className="font-black text-slate-900">
                            Réponses du QCM
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Renseignez 4 choix et cochez la bonne réponse.
                        </p>

                        <div className="mt-5 space-y-3">
                            {[0, 1, 2, 3].map((index) => (
                                <label
                                    key={index}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                        correctChoice === String(index)
                                            ? "border-teal-400 bg-teal-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="correctChoice"
                                        value={index}
                                        checked={
                                            correctChoice === String(index)
                                        }
                                        onChange={() =>
                                            setCorrectChoice(String(index))
                                        }
                                        className="h-5 w-5 accent-teal-600"
                                    />

                                    <input
                                        name={`choice${index + 1}`}
                                        required
                                        placeholder={`Réponse ${index + 1}`}
                                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-slate-900 placeholder:text-slate-400 outline-none"
                                    />

                                    {correctChoice === String(index) && (
                                        <span className="hidden whitespace-nowrap text-xs font-bold text-teal-700 sm:block">
                                            ✓ Bonne réponse
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Bonne réponse
                        </label>

                        <input
                            name="answer"
                            placeholder={
                                exerciseType === "oral" ||
                                exerciseType === "challenge"
                                    ? "Facultatif pour ce type d'exercice"
                                    : "Réponse attendue"
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                        />
                    </div>
                )}

                <div
                    className={`rounded-2xl border p-5 transition ${
                        shareToWorkshop
                            ? "border-teal-200 bg-teal-50/70"
                            : "border-slate-200 bg-slate-50"
                    }`}
                >
                    <div className="flex items-center justify-between gap-5">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">
                                    {shareToWorkshop ? "🌐" : "🔒"}
                                </span>

                                <h3 className="font-black text-slate-900">
                                    {shareToWorkshop
                                        ? "Exercice public"
                                        : "Exercice privé"}
                                </h3>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {shareToWorkshop
                                    ? "Cet exercice sera publié dans le Workshop et pourra être ajouté par les autres professeurs."
                                    : "Cet exercice restera uniquement dans votre bibliothèque et ne sera pas visible dans le Workshop."}
                            </p>
                        </div>

                        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                            <input
                                type="checkbox"
                                name="shareToWorkshop"
                                value="true"
                                checked={shareToWorkshop}
                                onChange={(event) =>
                                    setShareToWorkshop(event.target.checked)
                                }
                                className="peer sr-only"
                            />

                            <span className="h-8 w-14 rounded-full bg-slate-300 transition peer-checked:bg-teal-500 peer-focus-visible:ring-4 peer-focus-visible:ring-teal-100" />

                            <span className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6" />
                        </label>
                    </div>

                    <div className="mt-4 border-t border-black/5 pt-4 text-xs font-bold">
                        <span
                            className={
                                shareToWorkshop
                                    ? "text-teal-700"
                                    : "text-slate-500"
                            }
                        >
                            {shareToWorkshop
                                ? "ON · Visible dans le Workshop"
                                : "OFF · Visible uniquement par vous"}
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-500 active:scale-[0.99]"
                >
                    Enregistrer l&apos;exercice
                </button>
            </form>
        </div>
    );
}

"use client";

import { useMemo, useState } from "react";
import { createExercise, updateExercise } from "./actions";

export type ExerciseItemFormValue = {
    id?: string;
    prompt: string;
    answer: string;
    speechText?: string;
    choices?: string[];
    correctChoice?: number;
};

export type ExerciseForEdit = {
    id: string;
    title: string | null;
    level: string;
    exercise_type: string;
    share_to_workshop: boolean;
    question: string;
    answer: string | null;
    choices: string[] | null;
    exercise_items?: Array<{
        id: string;
        position: number;
        prompt: string;
        answer: string | null;
        speech_text: string | null;
        choices: string[] | null;
    }> | null;
};

type ExerciseFormProps = {
    categoryId: string;
    exercise?: ExerciseForEdit;
    compactTrigger?: boolean;
};

const EMPTY_ITEM: ExerciseItemFormValue = {
    prompt: "",
    answer: "",
};

function legacyItems(exercise: ExerciseForEdit): ExerciseItemFormValue[] {
    const existing = [...(exercise.exercise_items ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
            id: item.id,
            prompt: item.prompt ?? "",
            answer: item.answer ?? "",
            speechText: item.speech_text ?? "",
            choices: Array.isArray(item.choices)
                ? item.choices
                : undefined,
            correctChoice:
                Array.isArray(item.choices) && item.answer
                    ? Math.max(
                          0,
                          item.choices.findIndex(
                              (choice) => choice === item.answer
                          )
                      )
                    : 0,
        }));

    if (existing.length > 0) {
        return existing;
    }

    return [
        {
            prompt: exercise.question ?? "",
            answer: exercise.answer ?? "",
            speechText:
                exercise.exercise_type === "voice"
                    ? exercise.question ?? ""
                    : "",
            choices: Array.isArray(exercise.choices)
                ? exercise.choices
                : undefined,
            correctChoice:
                Array.isArray(exercise.choices) && exercise.answer
                    ? Math.max(
                          0,
                          exercise.choices.findIndex(
                              (choice) => choice === exercise.answer
                          )
                      )
                    : 0,
        },
    ];
}

export default function ExerciseForm({
    categoryId,
    exercise,
    compactTrigger = false,
}: ExerciseFormProps) {
    const editing = Boolean(exercise);

    const [open, setOpen] = useState(false);
    const [exerciseType, setExerciseType] = useState(
        exercise?.exercise_type ?? "question"
    );
    const [shareToWorkshop, setShareToWorkshop] = useState(
        exercise?.share_to_workshop ?? true
    );

    const initialItems = useMemo(
        () => (exercise ? legacyItems(exercise) : [{ ...EMPTY_ITEM }]),
        [exercise]
    );

    const [items, setItems] =
        useState<ExerciseItemFormValue[]>(initialItems);

    function resetForm() {
        setExerciseType(exercise?.exercise_type ?? "question");
        setShareToWorkshop(exercise?.share_to_workshop ?? true);
        setItems(
            exercise ? legacyItems(exercise) : [{ ...EMPTY_ITEM }]
        );
    }

    function closeForm() {
        setOpen(false);
        resetForm();
    }

    function updateItem(
        index: number,
        patch: Partial<ExerciseItemFormValue>
    ) {
        setItems((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, ...patch }
                    : item
            )
        );
    }

    function addQuestion() {
        setItems((current) => [
            ...current,
            { ...EMPTY_ITEM },
        ]);
    }

    function removeQuestion(index: number) {
        setItems((current) =>
            current.length <= 1
                ? current
                : current.filter(
                      (_, itemIndex) => itemIndex !== index
                  )
        );
    }

    function handleTypeChange(value: string) {
        setExerciseType(value);

        if (value === "question" || value === "voice") {
            return;
        }

        setItems((current) => [
            current[0] ?? { ...EMPTY_ITEM },
        ]);
    }

    async function handleSubmit(formData: FormData) {
        formData.set(
            "itemsJson",
            JSON.stringify(
                items.map((item) => ({
                    prompt: item.prompt.trim(),
                    answer: item.answer.trim(),
                    speechText:
                        item.speechText?.trim() ?? "",
                    choices:
                        item.choices?.map((choice) =>
                            choice.trim()
                        ) ?? [],
                    correctChoice:
                        item.correctChoice ?? 0,
                }))
            )
        );

        if (editing && exercise) {
            await updateExercise(
                exercise.id,
                categoryId,
                formData
            );
        } else {
            await createExercise(
                categoryId,
                formData
            );
        }

        setOpen(false);

        if (!editing) {
            setExerciseType("question");
            setShareToWorkshop(true);
            setItems([{ ...EMPTY_ITEM }]);
        }
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                    editing
                        ? "cursor-pointer rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                        : compactTrigger
                          ? "cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-500"
                          : "cursor-pointer rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-500 active:scale-95"
                }
            >
                {editing
                    ? "✏️ Modifier"
                    : "+ Ajouter un exercice"}
            </button>
        );
    }

    return (
        <div
            className={
                editing
                    ? "fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
                    : ""
            }
            onMouseDown={(event) => {
                if (
                    editing &&
                    event.currentTarget === event.target
                ) {
                    closeForm();
                }
            }}
        >
            <div
                className={
                    editing
                        ? "max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7"
                        : "rounded-3xl bg-white p-6 shadow-sm"
                }
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            {editing
                                ? "Modifier l'exercice"
                                : "Nouvel exercice"}
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {exerciseType === "question"
                                ? "Vous pouvez regrouper plusieurs questions avec une réponse indépendante pour chacune."
                                : exerciseType === "voice"
                                  ? "Le texte sera lu à voix haute sans être affiché à l'élève."
                                  : "Configurez l'exercice puis enregistrez-le."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeForm}
                        className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                    >
                        Fermer
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Titre
                            </label>

                            <input
                                name="title"
                                defaultValue={
                                    exercise?.title ?? ""
                                }
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
                                defaultValue={
                                    exercise?.level ??
                                    "beginner"
                                }
                                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
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
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Type d&apos;exercice
                        </label>

                        <select
                            name="exerciseType"
                            value={exerciseType}
                            onChange={(event) =>
                                handleTypeChange(
                                    event.target.value
                                )
                            }
                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        >
                            <option value="question">
                                ✏️ Question
                            </option>
                            <option value="qcm">
                                ☑️ QCM
                            </option>
                            <option value="voice">
                                🔊 Écoute / Voix
                            </option>
                            <option value="oral">
                                🗣️ Oral
                            </option>
                            <option value="challenge">
                                🎯 Défi
                            </option>
                        </select>
                    </div>

                    {(exerciseType === "question" ||
                        exerciseType === "voice") && (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-black text-slate-900">
                                                {exerciseType ===
                                                "voice"
                                                    ? `Écoute ${index + 1}`
                                                    : `Question ${index + 1}`}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Réponse indépendante
                                            </p>
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeQuestion(
                                                        index
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>

                                    {exerciseType ===
                                    "question" ? (
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Question
                                            </label>

                                            <textarea
                                                value={
                                                    item.prompt
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        {
                                                            prompt:
                                                                event
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                rows={3}
                                                required
                                                placeholder="Ex : Combien font 7 × 8 ?"
                                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Texte à lire à
                                                l&apos;élève
                                            </label>

                                            <input
                                                value={
                                                    item.speechText ??
                                                    ""
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        {
                                                            speechText:
                                                                event
                                                                    .target
                                                                    .value,
                                                            prompt:
                                                                event
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                required
                                                placeholder="Ex : 43 ou éléphant"
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                            />

                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                Ce texte ne sera
                                                pas affiché à
                                                l&apos;élève. Le
                                                bouton 🔊 Écouter le
                                                fera lire par
                                                l&apos;appareil.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Bonne réponse
                                        </label>

                                        <input
                                            value={
                                                item.answer
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateItem(
                                                    index,
                                                    {
                                                        answer:
                                                            event
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            required
                                            placeholder="Réponse attendue"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addQuestion}
                                className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-4 font-black text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                            >
                                + Ajouter{" "}
                                {exerciseType ===
                                "voice"
                                    ? "une écoute"
                                    : "une question"}
                            </button>
                        </div>
                    )}

                    {exerciseType === "qcm" && (
                        <QcmEditor
                            item={
                                items[0] ?? {
                                    ...EMPTY_ITEM,
                                }
                            }
                            onChange={(patch) =>
                                updateItem(0, patch)
                            }
                        />
                    )}

                    {(exerciseType === "oral" ||
                        exerciseType === "challenge") && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Consigne
                                </label>

                                <textarea
                                    value={
                                        items[0]?.prompt ?? ""
                                    }
                                    onChange={(event) =>
                                        updateItem(0, {
                                            prompt:
                                                event.target
                                                    .value,
                                        })
                                    }
                                    required
                                    rows={4}
                                    placeholder="Écrivez la consigne..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Réponse indicative
                                    (facultative)
                                </label>

                                <input
                                    value={
                                        items[0]?.answer ?? ""
                                    }
                                    onChange={(event) =>
                                        updateItem(0, {
                                            answer:
                                                event.target
                                                    .value,
                                        })
                                    }
                                    placeholder="Aide pour le professeur"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    )}

                    <input
                        type="hidden"
                        name="itemsJson"
                        value=""
                        readOnly
                    />

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
                                        {shareToWorkshop
                                            ? "🌐"
                                            : "🔒"}
                                    </span>

                                    <h3 className="font-black text-slate-900">
                                        {shareToWorkshop
                                            ? "Exercice public"
                                            : "Exercice privé"}
                                    </h3>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {shareToWorkshop
                                        ? "Publié dans le Workshop avec toutes ses questions."
                                        : "Visible uniquement dans votre bibliothèque."}
                                </p>
                            </div>

                            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    name="shareToWorkshop"
                                    value="true"
                                    checked={
                                        shareToWorkshop
                                    }
                                    onChange={(event) =>
                                        setShareToWorkshop(
                                            event.target
                                                .checked
                                        )
                                    }
                                    className="peer sr-only"
                                />

                                <span className="h-8 w-14 rounded-full bg-slate-300 transition peer-checked:bg-teal-500 peer-focus-visible:ring-4 peer-focus-visible:ring-teal-100" />
                                <span className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6" />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full cursor-pointer rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-500 active:scale-[0.99]"
                    >
                        {editing
                            ? "Enregistrer les modifications"
                            : "Enregistrer l'exercice"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function QcmEditor({
    item,
    onChange,
}: {
    item: ExerciseItemFormValue;
    onChange: (
        patch: Partial<ExerciseItemFormValue>
    ) => void;
}) {
    const choices =
        item.choices?.length === 4
            ? item.choices
            : ["", "", "", ""];

    const correctChoice =
        item.correctChoice ?? 0;

    function updateChoice(
        index: number,
        value: string
    ) {
        const next = [...choices];
        next[index] = value;

        onChange({
            choices: next,
            correctChoice,
            answer:
                index === correctChoice
                    ? value
                    : item.answer,
        });
    }

    return (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <label className="mb-2 block text-sm font-bold text-slate-700">
                Question
            </label>

            <textarea
                value={item.prompt}
                onChange={(event) =>
                    onChange({
                        prompt: event.target.value,
                    })
                }
                required
                rows={3}
                placeholder="Écrivez la question du QCM..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
            />

            <h3 className="mt-5 font-black text-slate-900">
                Les 4 choix
            </h3>

            <div className="mt-3 space-y-3">
                {choices.map((choice, index) => (
                    <label
                        key={index}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                            correctChoice === index
                                ? "border-teal-400 bg-teal-50"
                                : "border-slate-200 bg-white"
                        }`}
                    >
                        <input
                            type="radio"
                            checked={
                                correctChoice === index
                            }
                            onChange={() =>
                                onChange({
                                    correctChoice:
                                        index,
                                    answer:
                                        choices[
                                            index
                                        ] ?? "",
                                })
                            }
                            className="h-5 w-5 accent-teal-600"
                        />

                        <input
                            value={choice}
                            onChange={(event) =>
                                updateChoice(
                                    index,
                                    event.target.value
                                )
                            }
                            required
                            placeholder={`Réponse ${index + 1}`}
                            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-slate-900 placeholder:text-slate-400 outline-none"
                        />

                        {correctChoice === index && (
                            <span className="hidden whitespace-nowrap text-xs font-bold text-teal-700 sm:block">
                                ✓ Bonne réponse
                            </span>
                        )}
                    </label>
                ))}
            </div>
        </div>
    );
}

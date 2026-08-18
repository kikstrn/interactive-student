/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { createExercise, updateExercise } from "./actions";

export type ExerciseItemFormValue = {
    id?: string;
    prompt: string;
    answer: string;
    speechText?: string;
    speechMode?: "synthetic" | "recorded";
    audioUrl?: string;
    audioBlob?: Blob;
    audioPreview?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageFile?: File;
    imagePreview?: string;
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
        speech_mode: string | null;
        audio_url: string | null;
        image_url: string | null;
        image_alt: string | null;
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
        .map<ExerciseItemFormValue>((item) => ({
            id: item.id,
            prompt: item.prompt ?? "",
            answer: item.answer ?? "",
            speechText: item.speech_text ?? "",
            speechMode:
                item.speech_mode === "recorded"
                    ? "recorded"
                    : "synthetic",
            audioUrl: item.audio_url ?? "",
            imageUrl: item.image_url ?? "",
            imageAlt: item.image_alt ?? "",
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
            speechMode: "synthetic",
            audioUrl: "",
            imageUrl: "",
            imageAlt: "",
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
    const [submitting, setSubmitting] = useState(false);
    const [mediaError, setMediaError] = useState("");

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

        if (value === "question" || value === "voice" || value === "image") {
            return;
        }

        setItems((current) => [
            current[0] ?? { ...EMPTY_ITEM },
        ]);
    }

    function browserSupabase() {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        if (!url || !key) {
            throw new Error("Configuration Supabase manquante.");
        }

        return createBrowserClient(url, key);
    }

    async function uploadMedia(
        currentItems: ExerciseItemFormValue[]
    ): Promise<ExerciseItemFormValue[]> {
        const supabase = browserSupabase();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Session expirée. Reconnectez-vous.");
        }

        const uploaded: ExerciseItemFormValue[] = [];

        for (const item of currentItems) {
            let audioUrl = item.audioUrl ?? "";
            let imageUrl = item.imageUrl ?? "";

            if (item.audioBlob) {
                if (item.audioBlob.size > 10 * 1024 * 1024) {
                    throw new Error("L'enregistrement audio dépasse 10 Mo.");
                }

                const mime = item.audioBlob.type || "audio/webm";
                const extension = mime.includes("mp4") || mime.includes("m4a")
                    ? "m4a"
                    : mime.includes("ogg")
                      ? "ogg"
                      : "webm";
                const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
                const { error } = await supabase.storage
                    .from("exercise-audio")
                    .upload(path, item.audioBlob, {
                        contentType: mime,
                        upsert: false,
                    });

                if (error) throw error;

                audioUrl = supabase.storage
                    .from("exercise-audio")
                    .getPublicUrl(path).data.publicUrl;
            }

            if (item.imageFile) {
                if (item.imageFile.size > 6 * 1024 * 1024) {
                    throw new Error("L'image dépasse 6 Mo.");
                }

                const extension =
                    item.imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
                const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
                const { error } = await supabase.storage
                    .from("exercise-images")
                    .upload(path, item.imageFile, {
                        contentType: item.imageFile.type || "image/jpeg",
                        upsert: false,
                    });

                if (error) throw error;

                imageUrl = supabase.storage
                    .from("exercise-images")
                    .getPublicUrl(path).data.publicUrl;
            }

            uploaded.push({
                ...item,
                audioUrl,
                imageUrl,
            });
        }

        return uploaded;
    }

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        setMediaError("");

        try {
            const preparedItems = await uploadMedia(items);

            formData.set(
                "itemsJson",
                JSON.stringify(
                    preparedItems.map((item) => ({
                        prompt: item.prompt.trim(),
                        answer: item.answer.trim(),
                        speechText: item.speechText?.trim() ?? "",
                        speechMode:
                            item.speechMode === "recorded"
                                ? "recorded"
                                : "synthetic",
                        audioUrl: item.audioUrl ?? "",
                        imageUrl: item.imageUrl ?? "",
                        imageAlt: item.imageAlt?.trim() ?? "",
                        choices: item.choices?.map((choice) => choice.trim()) ?? [],
                        correctChoice: item.correctChoice ?? 0,
                    }))
                )
            );

            if (editing && exercise) {
                await updateExercise(exercise.id, categoryId, formData);
            } else {
                await createExercise(categoryId, formData);
            }

            setOpen(false);

            if (!editing) {
                setExerciseType("question");
                setShareToWorkshop(true);
                setItems([{ ...EMPTY_ITEM }]);
            }
        } catch (error) {
            console.error("exercise media upload:", error);
            setMediaError(
                error instanceof Error
                    ? error.message
                    : "Impossible d'envoyer le média."
            );
        } finally {
            setSubmitting(false);
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
                                  ? "Choisissez la synthèse vocale ou enregistrez directement votre propre voix."
                                  : exerciseType === "image"
                                    ? "Ajoutez une image puis demandez à l'élève ce qu'elle représente."
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
                            <option value="image">
                                🖼️ Image / Observation
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
                        exerciseType === "voice" ||
                        exerciseType === "image") && (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-black text-slate-900">
                                                {exerciseType === "voice"
                                                    ? `Écoute ${index + 1}`
                                                    : exerciseType === "image"
                                                      ? `Image ${index + 1}`
                                                      : `Question ${index + 1}`}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Réponse indépendante
                                            </p>
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(index)}
                                                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>

                                    {exerciseType === "voice" ? (
                                        <VoiceMediaEditor
                                            item={item}
                                            onChange={(patch) => updateItem(index, patch)}
                                        />
                                    ) : exerciseType === "image" ? (
                                        <ImageMediaEditor
                                            item={item}
                                            onChange={(patch) => updateItem(index, patch)}
                                        />
                                    ) : (
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Question
                                            </label>
                                            <textarea
                                                value={item.prompt}
                                                onChange={(event) =>
                                                    updateItem(index, { prompt: event.target.value })
                                                }
                                                rows={3}
                                                required
                                                placeholder="Ex : Combien font 7 × 8 ?"
                                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Bonne réponse
                                        </label>
                                        <input
                                            value={item.answer}
                                            onChange={(event) =>
                                                updateItem(index, { answer: event.target.value })
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
                                + Ajouter {exerciseType === "voice" ? "une écoute" : exerciseType === "image" ? "une image" : "une question"}
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

                    {mediaError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                            {mediaError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full cursor-pointer rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting
                            ? "Envoi des médias..."
                            : editing
                              ? "Enregistrer les modifications"
                              : "Enregistrer l'exercice"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function VoiceMediaEditor({
    item,
    onChange,
}: {
    item: ExerciseItemFormValue;
    onChange: (patch: Partial<ExerciseItemFormValue>) => void;
}) {
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [recording, setRecording] = useState(false);
    const [recorderError, setRecorderError] = useState("");

    const mode: "synthetic" | "recorded" =
        item.speechMode === "recorded"
            ? "recorded"
            : "synthetic";
    const audioSrc = item.audioPreview || item.audioUrl || "";

    async function startRecording() {
        setRecorderError("");

        try {
            if (
                typeof MediaRecorder === "undefined" ||
                !navigator.mediaDevices?.getUserMedia
            ) {
                throw new Error(
                    "L’enregistrement audio n’est pas pris en charge par ce navigateur."
                );
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;

            const candidates = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/mp4",
            ];
            const mimeType = candidates.find(
                (candidate) =>
                    typeof MediaRecorder !== "undefined" &&
                    MediaRecorder.isTypeSupported(candidate)
            );

            const recorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : undefined
            );

            chunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: recorder.mimeType || "audio/webm",
                });
                const preview = URL.createObjectURL(blob);
                onChange({
                    speechMode: "recorded",
                    audioBlob: blob,
                    audioPreview: preview,
                });
                streamRef.current?.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                setRecording(false);
            };

            recorderRef.current = recorder;
            recorder.start();
            setRecording(true);
        } catch (error) {
            console.error(error);
            setRecorderError(
                error instanceof Error
                    ? error.message
                    : "Impossible d'accéder au microphone. Vérifiez l'autorisation du navigateur."
            );
        }
    }

    function stopRecording() {
        if (recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
        }
    }

    function clearRecording() {
        if (item.audioPreview) URL.revokeObjectURL(item.audioPreview);
        onChange({
            audioBlob: undefined,
            audioPreview: "",
            audioUrl: "",
        });
    }

    return (
        <div>
            <label className="mb-3 block text-sm font-bold text-slate-700">
                Comment lire la consigne ?
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onChange({ speechMode: "synthetic" })}
                    className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                        mode === "synthetic"
                            ? "border-indigo-400 bg-indigo-50 ring-4 ring-indigo-100"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                >
                    <p className="font-black text-slate-900">🤖 Voix KLIKAO</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Synthèse vocale de l&apos;appareil.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => onChange({ speechMode: "recorded" })}
                    className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                        mode === "recorded"
                            ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                >
                    <p className="font-black text-slate-900">🎙️ Ma propre voix</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Enregistrez directement la prononciation.
                    </p>
                </button>
            </div>

            {mode === "synthetic" ? (
                <div className="mt-4">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Texte à prononcer
                    </label>
                    <input
                        value={item.speechText ?? ""}
                        onChange={(event) =>
                            onChange({
                                speechText: event.target.value,
                                prompt: event.target.value,
                            })
                        }
                        required
                        placeholder="Ex : 43 ou éléphant"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                    />
                </div>
            ) : (
                <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                    <div className="flex flex-wrap gap-2">
                        {!recording ? (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="cursor-pointer rounded-xl bg-teal-600 px-4 py-3 text-sm font-black text-white hover:bg-teal-500"
                            >
                                🎙️ {audioSrc ? "Réenregistrer" : "Commencer l'enregistrement"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="cursor-pointer rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500"
                            >
                                ⏹ Arrêter
                            </button>
                        )}

                        {audioSrc && !recording && (
                            <button
                                type="button"
                                onClick={clearRecording}
                                className="cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50"
                            >
                                🗑️ Supprimer
                            </button>
                        )}
                    </div>

                    {recording && (
                        <p className="mt-3 animate-pulse text-sm font-black text-red-600">
                            ● Enregistrement en cours...
                        </p>
                    )}

                    {audioSrc && !recording && (
                        <audio controls src={audioSrc} className="mt-4 w-full" />
                    )}

                    {recorderError && (
                        <p className="mt-3 text-sm font-bold text-red-600">
                            {recorderError}
                        </p>
                    )}

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Transcription interne (facultative)
                        </label>
                        <input
                            value={item.speechText ?? ""}
                            onChange={(event) =>
                                onChange({
                                    speechText: event.target.value,
                                    prompt: event.target.value || "Écoute l'enregistrement",
                                })
                            }
                            placeholder="Ex : quarante-trois"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function ImageMediaEditor({
    item,
    onChange,
}: {
    item: ExerciseItemFormValue;
    onChange: (patch: Partial<ExerciseItemFormValue>) => void;
}) {
    const imageSrc = item.imagePreview || item.imageUrl || "";

    function chooseImage(file?: File) {
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        const preview = URL.createObjectURL(file);
        onChange({
            imageFile: file,
            imagePreview: preview,
        });
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                    Image à montrer à l&apos;élève
                </label>
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-5 text-center transition hover:bg-indigo-50">
                    <span className="text-4xl">🖼️</span>
                    <span className="mt-2 font-black text-indigo-700">
                        {imageSrc ? "Changer l'image" : "Choisir une image"}
                    </span>
                    <span className="mt-1 text-xs text-slate-400">
                        JPG, PNG, WEBP · 6 Mo maximum
                    </span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(event) => chooseImage(event.target.files?.[0])}
                    />
                </label>
            </div>

            {imageSrc && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                    <img
                        src={imageSrc}
                        alt={item.imageAlt || "Aperçu de l'exercice"}
                        className="mx-auto max-h-72 w-auto rounded-xl object-contain"
                    />
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                    Question
                </label>
                <input
                    value={item.prompt}
                    onChange={(event) => onChange({ prompt: event.target.value })}
                    required
                    placeholder="Ex : Qu'est-ce que cela représente ?"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description de l&apos;image (facultative)
                </label>
                <input
                    value={item.imageAlt ?? ""}
                    onChange={(event) => onChange({ imageAlt: event.target.value })}
                    placeholder="Ex : Une pomme rouge"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                />
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
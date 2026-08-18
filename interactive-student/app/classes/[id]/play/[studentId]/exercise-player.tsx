"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recordStudentAnswer } from "./result-actions";

type ExerciseItem = {
    id?: string;
    position: number;
    prompt: string;
    answer: string | null;
    speech_text: string | null;
    speech_mode?: string | null;
    audio_url?: string | null;
    image_url?: string | null;
    image_alt?: string | null;
    choices?: string[] | null;
};

type Exercise = {
    id: string;
    title: string | null;
    question: string;
    answer: string | null;
    exercise_type: string;
    choices?: string[] | null;
    category_name: string | null;
    category_icon: string | null;
    items?: ExerciseItem[] | null;
};

type ExercisePlayerProps = {
    exercise: Exercise;
    inputType: "text" | "numeric";
    classId: string;
    studentId: string;
    adaptiveHint?: {
        active: boolean;
        categoryName: string;
        successRate: number;
    } | null;
};

function normalizeAnswer(value: string) {
    return value
        .trim()
        .toLocaleLowerCase("fr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .replace(",", ".");
}

export default function ExercisePlayer({
    exercise,
    inputType,
    classId,
    studentId,
    adaptiveHint,
}: ExercisePlayerProps) {
    const router = useRouter();

    const items = useMemo<ExerciseItem[]>(
        () => {
            if (
                Array.isArray(exercise.items) &&
                exercise.items.length > 0
            ) {
                return [...exercise.items].sort(
                    (a, b) =>
                        a.position - b.position
                );
            }

            return [
                {
                    position: 0,
                    prompt: exercise.question,
                    answer: exercise.answer,
                    speech_text:
                        exercise.exercise_type ===
                        "voice"
                            ? exercise.question
                            : null,
                    speech_mode: "synthetic",
                    audio_url: null,
                    image_url: null,
                    image_alt: null,
                    choices:
                        exercise.choices ?? null,
                },
            ];
        },
        [exercise]
    );

    const [itemIndex, setItemIndex] =
        useState(0);
    const [studentAnswer, setStudentAnswer] =
        useState("");
    const [selectedChoice, setSelectedChoice] =
        useState<string | null>(null);
    const [validated, setValidated] =
        useState(false);
    const [isCorrect, setIsCorrect] =
        useState(false);
    const [speechSupported, setSpeechSupported] =
        useState(true);
    const [speaking, setSpeaking] =
        useState(false);
    const [savingResult, setSavingResult] =
        useState(false);
    const [resultSaved, setResultSaved] =
        useState(false);
    const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

    const currentItem =
        items[itemIndex] ?? items[0];

    const isQuestion =
        exercise.exercise_type === "question";
    const isQcm =
        exercise.exercise_type === "qcm";
    const isVoice =
        exercise.exercise_type === "voice";
    const isImage =
        exercise.exercise_type === "image";
    const isOral =
        exercise.exercise_type === "oral";
    const isChallenge =
        exercise.exercise_type === "challenge";

    const isTeacherValidation =
        isOral || isChallenge;

    const hasNextItem =
        itemIndex < items.length - 1;

    useEffect(() => {
        setSpeechSupported(
            typeof window !== "undefined" &&
                "speechSynthesis" in window
        );

        return () => {
            if (
                typeof window !== "undefined" &&
                "speechSynthesis" in window
            ) {
                window.speechSynthesis.cancel();
            }
            recordedAudioRef.current?.pause();
            recordedAudioRef.current = null;
        };
    }, []);

    function resetCurrentAnswer() {
        setStudentAnswer("");
        setSelectedChoice(null);
        setValidated(false);
        setIsCorrect(false);
        setSpeaking(false);
        setSavingResult(false);
        setResultSaved(false);
        recordedAudioRef.current?.pause();
        recordedAudioRef.current = null;
    }

    async function saveResult(
        correct: boolean,
        answerGiven: string | null
    ) {
        if (!currentItem || resultSaved) {
            return;
        }

        setSavingResult(true);

        const result =
            await recordStudentAnswer({
                classId,
                studentId,
                exerciseId: exercise.id,
                exerciseItemId:
                    currentItem.id ?? null,
                itemPosition:
                    currentItem.position ??
                    itemIndex,
                exerciseTitle:
                    exercise.title,
                exerciseType:
                    exercise.exercise_type,
                categoryName:
                    exercise.category_name,
                categoryIcon:
                    exercise.category_icon,
                prompt:
                    currentItem.prompt,
                studentAnswer:
                    answerGiven,
                expectedAnswer:
                    currentItem.answer,
                isCorrect: correct,
            });

        if (result.success) {
            setResultSaved(true);
        } else {
            console.error(
                "Impossible d'enregistrer le résultat :",
                result.reason
            );
        }

        setSavingResult(false);
    }

    function addNumber(value: string) {
        if (validated) return;
        setStudentAnswer(
            (current) => current + value
        );
    }

    function removeNumber() {
        if (validated) return;
        setStudentAnswer((current) =>
            current.slice(0, -1)
        );
    }

    function clearAnswer() {
        if (validated) return;
        setStudentAnswer("");
    }

    async function validateStudentAnswer() {
        if (!currentItem?.answer || savingResult) {
            return;
        }

        const answerToCheck = isQcm
            ? selectedChoice ?? ""
            : studentAnswer;

        if (!answerToCheck.trim()) return;

        const correct =
            normalizeAnswer(answerToCheck) ===
            normalizeAnswer(
                currentItem.answer
            );

        setIsCorrect(correct);
        setValidated(true);

        await saveResult(
            correct,
            answerToCheck
        );
    }

    async function validateByTeacher(
        correct: boolean
    ) {
        if (savingResult) return;

        setIsCorrect(correct);
        setValidated(true);

        await saveResult(
            correct,
            null
        );
    }

    function nextItem() {
        if (!hasNextItem || savingResult) return;
        setItemIndex((current) => current + 1);
        resetCurrentAnswer();
    }

    function nextExercise() {
        if (savingResult) return;

        router.push(
            `/classes/${classId}/play/${studentId}?new=${Date.now()}`
        );
    }

    function speakCurrentItem() {
        if (typeof window === "undefined" || !currentItem) {
            return;
        }

        if (currentItem.audio_url) {
            recordedAudioRef.current?.pause();
            const audio = new Audio(currentItem.audio_url);
            recordedAudioRef.current = audio;
            audio.onplay = () => setSpeaking(true);
            audio.onended = () => setSpeaking(false);
            audio.onerror = () => setSpeaking(false);
            void audio.play();
            return;
        }

        if (!speechSupported) return;

        const text =
            currentItem.speech_text?.trim() ||
            currentItem.prompt?.trim();

        if (!text) return;

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = "fr-FR";
        utterance.rate = 0.82;
        utterance.pitch = 1;

        const voices =
            window.speechSynthesis.getVoices();

        const frenchVoice = voices.find(
            (voice) =>
                voice.lang
                    .toLowerCase()
                    .startsWith("fr")
        );

        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        utterance.onstart = () =>
            setSpeaking(true);
        utterance.onend = () =>
            setSpeaking(false);
        utterance.onerror = () =>
            setSpeaking(false);

        window.speechSynthesis.speak(
            utterance
        );
    }

    const canValidate = isQcm
        ? Boolean(selectedChoice)
        : Boolean(studentAnswer.trim());

    const answerInput =
        (isQuestion || isVoice || isImage) &&
        !validated ? (
            inputType === "numeric" ? (
                <NumericAnswer
                    value={studentAnswer}
                    onAdd={addNumber}
                    onRemove={removeNumber}
                    onClear={clearAnswer}
                />
            ) : (
                <div className="mx-auto mt-8 max-w-4xl">
                    <label className="mb-3 block text-center text-lg font-bold text-slate-600">
                        {isVoice
                            ? "Écris ce que tu as entendu"
                            : isImage
                              ? "Écris ce que représente l'image"
                              : "Écris ta réponse"}
                    </label>

                    <input
                        value={studentAnswer}
                        onChange={(event) =>
                            setStudentAnswer(
                                event.target.value
                            )
                        }
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="Ta réponse..."
                        className="min-h-24 w-full rounded-3xl border-4 border-slate-200 bg-slate-50 px-6 text-center text-3xl font-black text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 sm:text-4xl"
                    />
                </div>
            )
        ) : null;

    return (
        <div className="mt-8 w-full max-w-6xl rounded-[2rem] bg-white p-7 text-slate-900 shadow-2xl sm:p-10 lg:p-14">
            <div className="flex flex-wrap items-center justify-center gap-3">
                {exercise.category_name && (
                    <span className="rounded-full bg-indigo-50 px-5 py-3 text-base font-black text-indigo-700 sm:text-lg">
                        {exercise.category_icon ??
                            "📚"}{" "}
                        {exercise.category_name}
                    </span>
                )}

                <span className="rounded-full bg-slate-100 px-5 py-3 text-base font-black text-slate-600 sm:text-lg">
                    {isQuestion && "Question"}
                    {isQcm && "QCM"}
                    {isVoice &&
                        "🔊 Écoute / Voix"}
                    {isImage && "🖼️ Image"}
                    {isOral && "Oral"}
                    {isChallenge && "Défi"}
                </span>

                {items.length > 1 && (
                    <span className="rounded-full bg-violet-50 px-5 py-3 text-base font-black text-violet-700 sm:text-lg">
                        {itemIndex + 1} /{" "}
                        {items.length}
                    </span>
                )}

                {adaptiveHint?.active && (
                    <span
                        title={`KLIKAO favorise actuellement ${adaptiveHint.categoryName} car le taux de réussite récent est de ${adaptiveHint.successRate} %.`}
                        className="rounded-full bg-amber-50 px-5 py-3 text-base font-black text-amber-700 sm:text-lg"
                    >
                        🧠 Entraînement adapté
                    </span>
                )}
            </div>

            {exercise.title && (
                <h2 className="mt-7 text-center text-2xl font-black text-slate-500 sm:text-3xl">
                    {exercise.title}
                </h2>
            )}

            {isVoice ? (
                <div className="mx-auto mt-8 max-w-4xl rounded-3xl bg-indigo-50 px-6 py-10 text-center sm:px-10">
                    <div className="text-7xl">
                        🔊
                    </div>

                    <h3 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">
                        Écoute bien
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-lg font-semibold leading-7 text-slate-500">
                        Appuie sur le bouton, écoute
                        attentivement puis écris ce
                        que tu as entendu.
                    </p>

                    <button
                        type="button"
                        onClick={speakCurrentItem}
                        disabled={
                            (!currentItem?.audio_url && !speechSupported) ||
                            speaking
                        }
                        className="mx-auto mt-7 flex min-h-20 min-w-64 cursor-pointer items-center justify-center rounded-3xl bg-indigo-600 px-8 text-2xl font-black text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {speaking
                            ? "🔊 Lecture..."
                            : "🔊 Écouter"}
                    </button>

                    {!currentItem?.audio_url && !speechSupported && (
                        <p className="mt-4 font-bold text-red-600">
                            La lecture vocale
                            n&apos;est pas disponible
                            sur ce navigateur.
                        </p>
                    )}
                </div>
            ) : isImage ? (
                <div className="mx-auto mt-8 max-w-5xl rounded-3xl bg-slate-50 p-5 text-center sm:p-8">
                    {currentItem?.image_url && (
                        <img
                            src={currentItem.image_url}
                            alt={currentItem.image_alt || "Image de l'exercice"}
                            className="mx-auto max-h-[420px] w-auto max-w-full rounded-2xl object-contain shadow-sm"
                        />
                    )}
                    <p className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        {currentItem?.prompt}
                    </p>
                </div>
            ) : (
                <div className="mx-auto mt-8 flex min-h-64 max-w-5xl items-center justify-center rounded-3xl bg-slate-50 px-6 py-10 text-center sm:min-h-72 sm:px-10">
                    <p className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        {currentItem?.prompt}
                    </p>
                </div>
            )}

            {answerInput}

            {isQcm && !validated && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {currentItem?.choices?.map(
                        (choice, index) => {
                            const selected =
                                selectedChoice ===
                                choice;

                            return (
                                <button
                                    key={`${choice}-${index}`}
                                    type="button"
                                    onClick={() =>
                                        setSelectedChoice(
                                            choice
                                        )
                                    }
                                    className={`min-h-28 cursor-pointer rounded-3xl border-4 px-6 text-2xl font-black transition active:scale-95 ${
                                        selected
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                                            : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                                    }`}
                                >
                                    {choice}
                                </button>
                            );
                        }
                    )}
                </div>
            )}

            {!validated &&
                (isQuestion ||
                    isQcm ||
                    isVoice ||
                    isImage) && (
                    <button
                        type="button"
                        disabled={
                            !canValidate ||
                            !currentItem?.answer
                        }
                        onClick={
                            validateStudentAnswer
                        }
                        className="mt-8 flex min-h-24 w-full cursor-pointer items-center justify-center rounded-3xl bg-indigo-600 px-8 text-2xl font-black text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ✓ Valider ma réponse
                    </button>
                )}

            {isTeacherValidation &&
                !validated && (
                    <div className="mt-10">
                        <p className="mb-5 text-center text-lg font-bold text-slate-500">
                            Validation par le
                            professeur
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() =>
                                    validateByTeacher(
                                        false
                                    )
                                }
                                className="flex min-h-28 cursor-pointer items-center justify-center rounded-3xl bg-red-100 px-8 text-2xl font-black text-red-700 transition hover:bg-red-200 active:scale-95"
                            >
                                ✕ Mauvaise réponse
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    validateByTeacher(
                                        true
                                    )
                                }
                                className="flex min-h-28 cursor-pointer items-center justify-center rounded-3xl bg-emerald-600 px-8 text-2xl font-black text-white transition hover:bg-emerald-500 active:scale-95"
                            >
                                ✓ Bonne réponse
                            </button>
                        </div>
                    </div>
                )}

            {savingResult && (
                <p className="mt-5 text-center text-sm font-bold text-indigo-500">
                    Enregistrement de la progression...
                </p>
            )}

            {validated && (
                <div
                    className={`mt-8 rounded-3xl p-8 text-center sm:p-10 ${
                        isCorrect
                            ? "bg-emerald-50"
                            : "bg-red-50"
                    }`}
                >
                    {isCorrect ? (
                        <>
                            <div className="text-7xl">
                                🎉
                            </div>
                            <h3 className="mt-4 text-3xl font-black text-emerald-700 sm:text-4xl">
                                Bonne réponse !
                            </h3>
                        </>
                    ) : (
                        <>
                            <div className="text-7xl">
                                ❌
                            </div>
                            <h3 className="mt-4 text-3xl font-black text-red-700 sm:text-4xl">
                                Mauvaise réponse
                            </h3>

                            {currentItem?.answer && (
                                <div className="mt-6">
                                    <p className="text-lg font-bold text-red-500">
                                        La bonne réponse
                                        était :
                                    </p>
                                    <p className="mt-2 text-4xl font-black text-red-900 sm:text-5xl">
                                        {
                                            currentItem.answer
                                        }
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {validated && hasNextItem && (
                <button
                    type="button"
                    onClick={nextItem}
                    disabled={savingResult}
                    className="mt-8 flex min-h-24 w-full cursor-pointer items-center justify-center rounded-3xl bg-violet-600 px-8 text-center text-xl font-black text-white transition hover:bg-violet-500 active:scale-95 sm:text-2xl"
                >
                    Question suivante →
                </button>
            )}

            {validated && !hasNextItem && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={nextExercise}
                        disabled={savingResult}
                        className="flex min-h-24 cursor-pointer items-center justify-center rounded-3xl bg-amber-100 px-8 text-center text-xl font-black text-amber-900 transition hover:bg-amber-200 active:scale-95 sm:text-2xl"
                    >
                        🎲 Nouvel exercice
                    </button>

                    <Link
                        href={`/classes/${classId}/play`}
                        className="flex min-h-24 cursor-pointer items-center justify-center rounded-3xl bg-indigo-600 px-8 text-center text-xl font-black text-white transition hover:bg-indigo-500 active:scale-95 sm:text-2xl"
                    >
                        ✓ Terminer
                    </Link>
                </div>
            )}
        </div>
    );
}

function NumericAnswer({
    value,
    onAdd,
    onRemove,
    onClear,
}: {
    value: string;
    onAdd: (value: string) => void;
    onRemove: () => void;
    onClear: () => void;
}) {
    return (
        <div className="mx-auto mt-8 max-w-xl">
            <p className="mb-4 text-center text-lg font-bold text-slate-600">
                Entre ta réponse
            </p>

            <div className="mb-5 flex min-h-28 items-center justify-center rounded-3xl border-4 border-indigo-200 bg-slate-50 px-6">
                <span className="break-all text-center text-5xl font-black text-slate-900">
                    {value || "?"}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                ].map((number) => (
                    <button
                        key={number}
                        type="button"
                        onClick={() =>
                            onAdd(number)
                        }
                        className="flex h-24 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-4xl font-black text-slate-900 transition hover:bg-slate-200 active:scale-95"
                    >
                        {number}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => onAdd("-")}
                    className="flex h-24 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-4xl font-black text-slate-700 transition hover:bg-slate-200 active:scale-95"
                >
                    −
                </button>

                <button
                    type="button"
                    onClick={() => onAdd("0")}
                    className="flex h-24 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-4xl font-black text-slate-900 transition hover:bg-slate-200 active:scale-95"
                >
                    0
                </button>

                <button
                    type="button"
                    onClick={() => onAdd(",")}
                    className="flex h-24 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-4xl font-black text-slate-900 transition hover:bg-slate-200 active:scale-95"
                >
                    ,
                </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onClear}
                    className="flex h-20 cursor-pointer items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600 transition hover:bg-red-100 active:scale-95"
                >
                    ✕ Effacer
                </button>

                <button
                    type="button"
                    onClick={onRemove}
                    className="flex h-20 cursor-pointer items-center justify-center rounded-2xl bg-slate-200 text-3xl font-black text-slate-700 transition hover:bg-slate-300 active:scale-95"
                >
                    ⌫
                </button>
            </div>
        </div>
    );
}

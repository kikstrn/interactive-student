"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Exercise = {
    id: string;
    title: string | null;
    question: string;
    answer: string | null;
    exercise_type: string;
    choices?: string[] | null;
    category_name: string | null;
    category_icon: string | null;
};

type ExercisePlayerProps = {
    exercise: Exercise;
    inputType: "text" | "numeric";
    classId: string;
    studentId: string;
};

const TEXT_ROWS = [
    ["A","Z","E","R","T","Y","U","I","O","P"],
    ["Q","S","D","F","G","H","J","K","L","M"],
    ["W","X","C","V","B","N","É","È","Ê","À"],
];

function normalizeAnswer(value: string) {
    return value
        .trim()
        .toLocaleLowerCase("fr")
        .replace(/\s+/g, " ")
        .replace(",", ".");
}

export default function ExercisePlayer({
    exercise,
    inputType,
    classId,
    studentId,
}: ExercisePlayerProps) {
    const router = useRouter();
    const [studentAnswer, setStudentAnswer] = useState("");
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [validated, setValidated] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const isQuestion = exercise.exercise_type === "question";
    const isQcm =
        exercise.exercise_type === "qcm" &&
        Array.isArray(exercise.choices) &&
        exercise.choices.length > 0;
    const isOral = exercise.exercise_type === "oral";
    const isChallenge = exercise.exercise_type === "challenge";
    const isTeacherValidation = isOral || isChallenge;

    function append(value: string) {
        if (!validated) setStudentAnswer((current) => current + value);
    }

    function removeLast() {
        if (!validated) setStudentAnswer((current) => current.slice(0, -1));
    }

    function clearAnswer() {
        if (!validated) setStudentAnswer("");
    }

    function validateStudentAnswer() {
        if (!exercise.answer) return;
        const answerToCheck = isQcm ? selectedChoice ?? "" : studentAnswer;
        if (!answerToCheck.trim()) return;

        setIsCorrect(
            normalizeAnswer(answerToCheck) === normalizeAnswer(exercise.answer)
        );
        setValidated(true);
    }

    function validateByTeacher(correct: boolean) {
        setIsCorrect(correct);
        setValidated(true);
    }

    function nextExercise() {
        router.push(
            `/classes/${classId}/play/${studentId}?new=${Date.now()}`
        );
    }

    const canValidate = isQcm
        ? Boolean(selectedChoice)
        : Boolean(studentAnswer.trim());

    return (
        <div className="mt-8 w-full max-w-6xl rounded-[2rem] bg-white p-7 text-slate-900 shadow-2xl sm:p-10 lg:p-14">
            <div className="flex flex-wrap items-center justify-center gap-3">
                {exercise.category_name && (
                    <span className="rounded-full bg-indigo-50 px-5 py-3 text-base font-black text-indigo-700 sm:text-lg">
                        {exercise.category_icon ?? "📚"} {exercise.category_name}
                    </span>
                )}
                <span className="rounded-full bg-slate-100 px-5 py-3 text-base font-black text-slate-600 sm:text-lg">
                    {isQuestion && "Question"}
                    {isQcm && "QCM"}
                    {isOral && "Oral"}
                    {isChallenge && "Défi"}
                </span>
            </div>

            {exercise.title && (
                <h2 className="mt-7 text-center text-2xl font-black text-slate-500 sm:text-3xl">
                    {exercise.title}
                </h2>
            )}

            <div className="mx-auto mt-8 flex min-h-64 max-w-5xl items-center justify-center rounded-3xl bg-slate-50 px-6 py-10 text-center sm:min-h-72 sm:px-10">
                <p className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                    {exercise.question}
                </p>
            </div>

            {isQuestion && !validated && (
                <div className="mx-auto mt-8 max-w-5xl">
                    <p className="mb-3 text-center text-lg font-bold text-slate-600">
                        {inputType === "numeric" ? "Entre ta réponse" : "Écris ta réponse"}
                    </p>

                    <div className="flex min-h-24 items-center justify-center rounded-3xl border-4 border-indigo-300 bg-slate-50 px-6 text-center text-4xl font-black text-slate-900">
                        {studentAnswer || (
                            <span className="text-slate-300">Ta réponse...</span>
                        )}
                    </div>

                    {inputType === "numeric" ? (
                        <div className="mx-auto mt-5 max-w-xl">
                            <div className="grid grid-cols-3 gap-3">
                                {["1","2","3","4","5","6","7","8","9"].map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => append(key)}
                                        className="flex h-24 items-center justify-center rounded-2xl bg-slate-100 text-4xl font-black transition hover:bg-slate-200 active:scale-95"
                                    >
                                        {key}
                                    </button>
                                ))}
                                <button type="button" onClick={() => append("-")} className="h-24 rounded-2xl bg-slate-100 text-4xl font-black active:scale-95">−</button>
                                <button type="button" onClick={() => append("0")} className="h-24 rounded-2xl bg-slate-100 text-4xl font-black active:scale-95">0</button>
                                <button type="button" onClick={() => append(",")} className="h-24 rounded-2xl bg-slate-100 text-4xl font-black active:scale-95">,</button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3 rounded-3xl bg-slate-100 p-4 sm:p-5">
                            {TEXT_ROWS.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    {row.map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => append(key.toLocaleLowerCase("fr"))}
                                            className="flex h-16 min-w-14 flex-1 items-center justify-center rounded-xl bg-white px-2 text-2xl font-black shadow-sm transition active:scale-95 sm:h-20 sm:min-w-16"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            ))}

                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => append("'")}
                                    className="h-16 rounded-xl bg-white text-2xl font-black active:scale-95 sm:h-20"
                                >
                                    &apos;
                                </button>
                                <button
                                    type="button"
                                    onClick={() => append("-")}
                                    className="h-16 rounded-xl bg-white text-2xl font-black active:scale-95 sm:h-20"
                                >
                                    -
                                </button>
                                <button
                                    type="button"
                                    onClick={() => append(" ")}
                                    className="col-span-2 h-16 rounded-xl bg-white text-lg font-black active:scale-95 sm:h-20"
                                >
                                    Espace
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={clearAnswer}
                            className="flex h-20 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600 active:scale-95"
                        >
                            ✕ Effacer
                        </button>
                        <button
                            type="button"
                            onClick={removeLast}
                            className="flex h-20 items-center justify-center rounded-2xl bg-slate-200 text-3xl font-black text-slate-700 active:scale-95"
                        >
                            ⌫
                        </button>
                    </div>
                </div>
            )}

            {isQcm && !validated && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {exercise.choices?.map((choice, index) => {
                        const selected = selectedChoice === choice;
                        return (
                            <button
                                key={`${choice}-${index}`}
                                type="button"
                                onClick={() => setSelectedChoice(choice)}
                                className={`min-h-28 rounded-3xl border-4 px-6 text-2xl font-black transition active:scale-95 ${
                                    selected
                                        ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                                        : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
                                }`}
                            >
                                {choice}
                            </button>
                        );
                    })}
                </div>
            )}

            {!validated && (isQuestion || isQcm) && (
                <button
                    type="button"
                    disabled={!canValidate || !exercise.answer}
                    onClick={validateStudentAnswer}
                    className="mt-8 flex min-h-24 w-full items-center justify-center rounded-3xl bg-indigo-600 px-8 text-2xl font-black text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    ✓ Valider ma réponse
                </button>
            )}

            {isTeacherValidation && !validated && (
                <div className="mt-10">
                    <p className="mb-5 text-center text-lg font-bold text-slate-500">
                        Validation par le professeur
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => validateByTeacher(false)}
                            className="min-h-28 rounded-3xl bg-red-100 px-8 text-2xl font-black text-red-700 active:scale-95"
                        >
                            ✕ Mauvaise réponse
                        </button>
                        <button
                            type="button"
                            onClick={() => validateByTeacher(true)}
                            className="min-h-28 rounded-3xl bg-emerald-600 px-8 text-2xl font-black text-white active:scale-95"
                        >
                            ✓ Bonne réponse
                        </button>
                    </div>
                </div>
            )}

            {validated && (
                <div className={`mt-8 rounded-3xl p-8 text-center sm:p-10 ${isCorrect ? "bg-emerald-50" : "bg-red-50"}`}>
                    {isCorrect ? (
                        <>
                            <div className="text-7xl">🎉</div>
                            <h3 className="mt-4 text-3xl font-black text-emerald-700 sm:text-4xl">
                                Bonne réponse !
                            </h3>
                        </>
                    ) : (
                        <>
                            <div className="text-7xl">❌</div>
                            <h3 className="mt-4 text-3xl font-black text-red-700 sm:text-4xl">
                                Mauvaise réponse
                            </h3>
                            {exercise.answer && (
                                <div className="mt-6">
                                    <p className="text-lg font-bold text-red-500">
                                        La bonne réponse était :
                                    </p>
                                    <p className="mt-2 text-4xl font-black text-red-900 sm:text-5xl">
                                        {exercise.answer}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {validated && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={nextExercise}
                        className="flex min-h-24 items-center justify-center rounded-3xl bg-amber-100 px-8 text-xl font-black text-amber-900 active:scale-95 sm:text-2xl"
                    >
                        🎲 Nouvel exercice
                    </button>
                    <Link
                        href={`/classes/${classId}/play`}
                        className="flex min-h-24 items-center justify-center rounded-3xl bg-indigo-600 px-8 text-xl font-black text-white active:scale-95 sm:text-2xl"
                    >
                        ✓ Terminer
                    </Link>
                </div>
            )}
        </div>
    );
}

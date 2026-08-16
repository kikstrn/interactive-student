"use client";

import { useEffect, useState } from "react";
import AvatarPicker from "@/components/students/avatar-picker";
import {
    deleteStudent,
    updateStudent,
} from "./actions";

type Student = {
    id: string;
    first_name: string;
    last_name: string | null;
    level: string;
    avatar: string | null;
};

type StudentCardProps = {
    student: Student;
    classId: string;
};

const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
};

export default function StudentCard({
    student,
    classId,
}: StudentCardProps) {
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!editing) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setEditing(false);
            }
        }

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [editing]);

    async function handleUpdate(
        formData: FormData
    ) {
        await updateStudent(
            student.id,
            classId,
            formData
        );

        setEditing(false);
    }

    return (
        <>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-4xl shadow-sm">
                        {student.avatar ?? "🙂"}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-slate-900">
                            {student.first_name}{" "}
                            {student.last_name ?? ""}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-500">
                            {levelLabels[
                                student.level
                            ] ?? student.level}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setEditing(true)
                        }
                        className="min-h-11 cursor-pointer rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                    >
                        ✏️ Modifier l&apos;élève
                    </button>

                    <form
                        action={deleteStudent.bind(
                            null,
                            student.id,
                            classId
                        )}
                    >
                        <button
                            type="submit"
                            className="min-h-11 w-full cursor-pointer rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-100"
                        >
                            Supprimer
                        </button>
                    </form>
                </div>
            </article>

            {editing && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (
                            event.currentTarget ===
                            event.target
                        ) {
                            setEditing(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`student-edit-${student.id}`}
                        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl"
                    >
                        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7 sm:py-5">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                                    {student.avatar ?? "🙂"}
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                        Élève
                                    </p>

                                    <h2
                                        id={`student-edit-${student.id}`}
                                        className="truncate text-xl font-black text-slate-900 sm:text-2xl"
                                    >
                                        Modifier{" "}
                                        {student.first_name}
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(false)
                                }
                                aria-label="Fermer"
                                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            action={handleUpdate}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Prénom
                                        </label>

                                        <input
                                            name="firstName"
                                            defaultValue={
                                                student.first_name
                                            }
                                            required
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Nom
                                        </label>

                                        <input
                                            name="lastName"
                                            defaultValue={
                                                student.last_name ??
                                                ""
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Niveau
                                        </label>

                                        <select
                                            name="level"
                                            defaultValue={
                                                student.level
                                            }
                                            className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
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

                                    <div className="md:col-span-2">
                                        <AvatarPicker
                                            defaultValue={
                                                student.avatar
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid shrink-0 gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:grid-cols-[auto_1fr] sm:px-7 sm:py-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditing(false)
                                    }
                                    className="min-h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 font-black text-slate-600 transition hover:bg-slate-100"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="min-h-12 cursor-pointer rounded-2xl bg-indigo-600 px-6 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 active:scale-[0.99]"
                                >
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

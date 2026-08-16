"use client";

import { useState } from "react";
import { deleteStudent, updateStudent } from "./actions";

type StudentCardProps = {
    student: {
        id: string;
        first_name: string;
        last_name: string | null;
        level: string;
        avatar: string | null;
    };
    classId: string;
};

const avatars = [
    "🙂",
    "😀",
    "😎",
    "🤓",
    "🦊",
    "🐼",
    "🐯",
    "🐵",
    "🐸",
    "🐧",
    "🦁",
    "🐨",
];

export default function StudentCard({
    student,
    classId,
}: StudentCardProps) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <article className="rounded-2xl bg-white p-5 shadow-sm">
                <form
                    action={async (formData) => {
                        await updateStudent(
                            student.id,
                            classId,
                            formData
                        );

                        setEditing(false);
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Prénom
                        </label>

                        <input
                            name="firstName"
                            defaultValue={student.first_name}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Nom
                        </label>

                        <input
                            name="lastName"
                            defaultValue={student.last_name ?? ""}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Niveau
                        </label>

                        <select
                            name="level"
                            defaultValue={student.level}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
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
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Avatar
                        </label>

                        <div className="grid grid-cols-6 gap-2">
                            {avatars.map((avatar) => (
                                <label
                                    key={avatar}
                                    className="cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="avatar"
                                        value={avatar}
                                        defaultChecked={
                                            (student.avatar ?? "🙂") ===
                                            avatar
                                        }
                                        className="peer sr-only"
                                    />

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-transparent bg-slate-100 text-2xl transition peer-checked:border-slate-900">
                                        {avatar}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
                        >
                            Enregistrer
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </article>
        );
    }

    return (
        <article className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-4xl">
                    {student.avatar ?? "🙂"}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                        {student.first_name} {student.last_name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {student.level === "beginner" && "Débutant"}
                        {student.level === "intermediate" && "Intermédiaire"}
                        {student.level === "advanced" && "Avancé"}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex gap-2">
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                    Modifier
                </button>

                <form
                    action={async () => {
                        await deleteStudent(
                            student.id,
                            classId
                        );
                    }}
                >
                    <button
                        type="submit"
                        className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        Supprimer
                    </button>
                </form>
            </div>
        </article>
    );
}
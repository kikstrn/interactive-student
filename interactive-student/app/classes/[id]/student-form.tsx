"use client";

import { useState } from "react";
import { createStudent } from "./actions";

type StudentFormProps = {
    classId: string;
};

export default function StudentForm({
    classId,
}: StudentFormProps) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        await createStudent(classId, formData);
        setOpen(false);
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
                + Ajouter un élève
            </button>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                    Ajouter un élève
                </h2>

                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-slate-500 hover:text-slate-900"
                >
                    Fermer
                </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Prénom
                    </label>

                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        placeholder="Emma"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
                    />
                </div>

                <div>
                    <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nom
                    </label>

                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Martin"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
                    />
                </div>

                <div>
                    <label
                        htmlFor="level"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Niveau
                    </label>

                    <select
                        id="level"
                        name="level"
                        defaultValue="beginner"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
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

                <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                    Ajouter l&apos;élève
                </button>
            </form>
        </div>
    );
}
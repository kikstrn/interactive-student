"use client";

import { useState } from "react";
import AvatarPicker from "@/components/students/avatar-picker";
import { createStudent } from "./actions";

type StudentFormProps = {
    classId: string;
};

export default function StudentForm({
    classId,
}: StudentFormProps) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(
        formData: FormData
    ) {
        await createStudent(
            classId,
            formData
        );

        setOpen(false);
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 font-black text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
                + Ajouter un élève
            </button>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        Ajouter un élève
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Renseignez ses informations
                        puis choisissez son avatar.
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

            <form
                action={handleSubmit}
                className="space-y-5"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Prénom
                        </label>

                        <input
                            name="firstName"
                            required
                            placeholder="Ex : Emma"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Nom
                        </label>

                        <input
                            name="lastName"
                            placeholder="Ex : Martin"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                        />
                    </div>
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

                <AvatarPicker />

                <button
                    type="submit"
                    className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-500 active:scale-[0.99]"
                >
                    Ajouter l&apos;élève
                </button>
            </form>
        </div>
    );
}

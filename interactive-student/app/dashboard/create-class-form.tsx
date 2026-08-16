"use client";

import { useState } from "react";
import { createClass } from "./actions";

export default function CreateClassForm() {
    const [open, setOpen] = useState(false);

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
                + Nouvelle classe
            </button>
        );
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                    Nouvelle classe
                </h3>

                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-slate-500 hover:text-slate-900"
                >
                    Fermer
                </button>
            </div>

            <form action={createClass} className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nom de la classe
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Ex : CE2 A"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
                    />
                </div>

                <div>
                    <label
                        htmlFor="grade"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Niveau scolaire
                    </label>

                    <select
                        id="grade"
                        name="grade"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    >
                        <option value="">Sélectionner</option>
                        <option value="CP">CP</option>
                        <option value="CE1">CE1</option>
                        <option value="CE2">CE2</option>
                        <option value="CM1">CM1</option>
                        <option value="CM2">CM2</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="schoolYear"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Année scolaire
                    </label>

                    <input
                        id="schoolYear"
                        name="schoolYear"
                        type="text"
                        placeholder="2026-2027"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                    Créer la classe
                </button>
            </form>
        </div>
    );
}
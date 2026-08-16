"use client";

import { useState } from "react";
import { createCategory } from "./actions";

const icons = [
    "🧮",
    "📚",
    "✏️",
    "🔤",
    "🇬🇧",
    "🌍",
    "🔬",
    "🎨",
    "🎵",
    "🧠",
];

export default function CategoryForm() {
    const [open, setOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] =
        useState("📚");

    async function handleSubmit(formData: FormData) {
        await createCategory(formData);

        setOpen(false);
        setSelectedIcon("📚");
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 active:scale-95"
            >
                + Nouvelle catégorie
            </button>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Nouvelle catégorie
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Créez une matière ou une famille
                        d&apos;exercices.
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
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Nom
                    </label>

                    <input
                        name="name"
                        required
                        placeholder="Ex : Mathématiques"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Description
                    </label>

                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Ex : Calcul, opérations et problèmes"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-3 block text-sm font-bold text-slate-700">
                        Icône
                    </label>

                    <div className="grid grid-cols-5 gap-2">
                        {icons.map((icon) => (
                            <label
                                key={icon}
                                className="cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="icon"
                                    value={icon}
                                    checked={
                                        selectedIcon === icon
                                    }
                                    onChange={() =>
                                        setSelectedIcon(icon)
                                    }
                                    className="peer sr-only"
                                />

                                <div className="flex h-14 items-center justify-center rounded-xl border-2 border-transparent bg-slate-100 text-2xl transition peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                    {icon}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Type de réponse
                    </label>

                    <select
                        name="inputType"
                        defaultValue="text"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                    >
                        <option value="text">
                            Clavier texte
                        </option>

                        <option value="numeric">
                            Pavé numérique
                        </option>
                    </select>

                    <p className="mt-2 text-xs text-slate-500">
                        Ce choix déterminera le clavier affiché
                        pendant les exercices de type Question.
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-500 active:scale-[0.99]"
                >
                    Créer la catégorie
                </button>
            </form>
        </div>
    );
}
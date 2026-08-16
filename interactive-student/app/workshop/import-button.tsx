"use client";

import { useState } from "react";
import { importWorkshopExercise } from "./actions";

type ImportButtonProps = {
    workshopId: string;
};

export default function ImportButton({
    workshopId,
}: ImportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleImport() {
        if (loading) {
            return;
        }

        setLoading(true);
        setMessage("");

        const result =
            await importWorkshopExercise(workshopId);

        setLoading(false);

        if (!result.success) {
            setMessage("Impossible d'ajouter cet exercice.");
            return;
        }

        if (result.alreadyImported) {
            setMessage("Déjà présent dans vos exercices.");
            return;
        }

        setMessage("✓ Ajouté à vos exercices");
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 font-black text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                    ? "Ajout en cours..."
                    : "＋ Ajouter à mes exercices"}
            </button>

            {message && (
                <p className="mt-2 text-center text-sm font-semibold text-slate-600">
                    {message}
                </p>
            )}
        </div>
    );
}

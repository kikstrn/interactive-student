"use client";

import { useState } from "react";
import { deleteExercise } from "./actions";

type DeleteExerciseButtonProps = {
    exerciseId: string;
    categoryId: string;
    exerciseTitle?: string | null;
};

export default function DeleteExerciseButton({
    exerciseId,
    categoryId,
    exerciseTitle,
}: DeleteExerciseButtonProps) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (deleting) return;

        setDeleting(true);

        try {
            await deleteExercise(
                exerciseId,
                categoryId
            );

            setOpen(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="cursor-pointer rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
                🗑️ Supprimer
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.currentTarget ===
                            event.target &&
                            !deleting
                        ) {
                            setOpen(false);
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                            🗑️
                        </div>

                        <h2 className="mt-5 text-2xl font-black text-slate-900">
                            Supprimer cet exercice ?
                        </h2>

                        <p className="mt-3 leading-7 text-slate-600">
                            {exerciseTitle ? (
                                <>
                                    L&apos;exercice{" "}
                                    <strong className="text-slate-900">
                                        « {exerciseTitle} »
                                    </strong>{" "}
                                    sera supprimé définitivement.
                                </>
                            ) : (
                                <>
                                    Cet exercice sera supprimé définitivement.
                                </>
                            )}
                        </p>

                        <p className="mt-3 text-sm font-semibold leading-6 text-red-600">
                            Ses questions associées seront également supprimées.
                            S&apos;il est publié dans le Workshop, sa publication
                            d&apos;origine sera retirée automatiquement.
                        </p>

                        <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(false)
                                }
                                disabled={deleting}
                                className="min-h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="min-h-12 cursor-pointer rounded-2xl bg-red-600 px-5 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting
                                    ? "Suppression..."
                                    : "Supprimer définitivement"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

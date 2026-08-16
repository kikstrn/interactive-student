"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyTeacherPin } from "./actions";

type ExitClassModeProps = {
    classId: string;
};

export default function ExitClassMode({
    classId,
}: ExitClassModeProps) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function addNumber(number: string) {
        if (loading || pin.length >= 4) {
            return;
        }

        setError("");
        setPin((current) => current + number);
    }

    function removeNumber() {
        if (loading) {
            return;
        }

        setError("");
        setPin((current) => current.slice(0, -1));
    }

    function clearPin() {
        if (loading) {
            return;
        }

        setError("");
        setPin("");
    }

    async function validatePin() {
        if (loading) {
            return;
        }

        if (pin.length !== 4) {
            setError("Saisissez votre PIN à 4 chiffres.");
            return;
        }

        setLoading(true);
        setError("");

        const result = await verifyTeacherPin(pin);

        setLoading(false);

        if (result.success) {
            router.push(`/classes/${classId}`);
            return;
        }

        setPin("");

        switch (result.reason) {
            case "locked":
                setError(
                    "Trop de tentatives. Réessayez dans une minute."
                );
                break;

            case "pin_not_configured":
                setError(
                    "Aucun PIN n'est configuré pour ce professeur."
                );
                break;

            case "unauthenticated":
                router.push("/login");
                break;

            default:
                setError("PIN incorrect.");
        }
    }

    function closeModal() {
        if (loading) {
            return;
        }

        setOpen(false);
        setPin("");
        setError("");
    }

    const numbers = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    ];

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setOpen(true);
                    setPin("");
                    setError("");
                }}
                className="rounded-xl bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/20 active:scale-95"
            >
                🔒 Quitter
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
                        <div className="text-center">
                            <div className="text-5xl">
                                🔒
                            </div>

                            <h2 className="mt-4 text-2xl font-bold">
                                Espace professeur
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Entrez votre PIN pour quitter le Mode Classe.
                            </p>
                        </div>

                        <div className="mt-7 flex justify-center gap-4">
                            {[0, 1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className={`h-5 w-5 rounded-full border-2 transition ${
                                        pin.length > index
                                            ? "border-indigo-600 bg-indigo-600"
                                            : "border-slate-300 bg-white"
                                    }`}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="mt-5 rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="mx-auto mt-7 grid max-w-sm grid-cols-3 gap-3">
                            {numbers.map((number) => (
                                <button
                                    key={number}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => addNumber(number)}
                                    className="flex h-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-bold text-slate-900 transition hover:bg-slate-200 active:scale-95 disabled:opacity-50 sm:h-24"
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={loading}
                                onClick={clearPin}
                                className="flex h-20 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50 sm:h-24"
                                aria-label="Effacer le code"
                            >
                                ✕
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => addNumber("0")}
                                className="flex h-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-bold text-slate-900 transition hover:bg-slate-200 active:scale-95 disabled:opacity-50 sm:h-24"
                            >
                                0
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={removeNumber}
                                className="flex h-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95 disabled:opacity-50 sm:h-24"
                                aria-label="Supprimer le dernier chiffre"
                            >
                                ⌫
                            </button>
                        </div>

                        <button
                            type="button"
                            disabled={loading || pin.length !== 4}
                            onClick={validatePin}
                            className="mt-5 w-full rounded-2xl bg-indigo-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading
                                ? "Vérification..."
                                : "Valider"}
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={closeModal}
                            className="mt-3 w-full rounded-2xl px-5 py-4 font-semibold text-slate-500 transition hover:bg-slate-100 active:scale-[0.98]"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
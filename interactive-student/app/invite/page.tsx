"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (password.length < 8) {
            setError(
                "Le mot de passe doit contenir au moins 8 caractères."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Les deux mots de passe ne correspondent pas."
            );
            return;
        }

        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            setError(
                "Votre invitation n'est plus valide. Merci de demander une nouvelle invitation."
            );
            return;
        }

        const { error: updateError } =
            await supabase.auth.updateUser({
                password,
            });

        if (updateError) {
            setLoading(false);
            setError(updateError.message);
            return;
        }

        router.replace("/dashboard");
        router.refresh();
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="text-5xl">
                        🎉
                    </div>

                    <h1 className="mt-5 text-3xl font-black text-slate-900">
                        Bienvenue sur KLIKAO
                    </h1>

                    <p className="mt-3 text-slate-500">
                        Votre invitation a été validée.
                        Choisissez maintenant votre mot de passe.
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Mot de passe
                        </label>

                        <input
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="new-password"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Confirmer le mot de passe
                        </label>

                        <input
                            type="password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="new-password"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Activation..."
                            : "Créer mon mot de passe"}
                    </button>
                </form>
            </div>
        </main>
    );
}
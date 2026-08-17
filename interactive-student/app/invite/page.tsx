"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/ui/password-input"

export default function InvitePage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const [error, setError] = useState("");
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        async function initializeInvitation() {
            try {
                setCheckingSession(true);
                setError("");

                /*
                 * Les invitations Supabase peuvent arriver sous cette forme :
                 *
                 * /invite#access_token=...&refresh_token=...&type=invite
                 *
                 * Le fragment # n'est jamais envoyé au serveur.
                 * On le lit donc directement dans le navigateur.
                 */

                const hash = window.location.hash;

                if (hash) {
                    const params = new URLSearchParams(
                        hash.substring(1)
                    );

                    const accessToken =
                        params.get("access_token");

                    const refreshToken =
                        params.get("refresh_token");

                    const errorDescription =
                        params.get("error_description");

                    if (errorDescription) {
                        setError(
                            decodeURIComponent(
                                errorDescription
                            )
                        );

                        setCheckingSession(false);
                        return;
                    }

                    if (accessToken && refreshToken) {
                        const {
                            data,
                            error: sessionError,
                        } =
                            await supabase.auth.setSession({
                                access_token:
                                    accessToken,
                                refresh_token:
                                    refreshToken,
                            });

                        if (sessionError) {
                            console.error(
                                "Erreur setSession:",
                                sessionError
                            );

                            setError(
                                "Cette invitation n'est plus valide ou a expiré. Merci de demander une nouvelle invitation."
                            );

                            setCheckingSession(false);
                            return;
                        }

                        if (data.session) {
                            setSessionReady(true);

                            /*
                             * On retire les tokens de l'URL
                             * une fois la session enregistrée.
                             */
                            window.history.replaceState(
                                {},
                                document.title,
                                "/invite"
                            );

                            setCheckingSession(false);
                            return;
                        }
                    }
                }

                /*
                 * Si aucun token n'est présent dans l'URL,
                 * on vérifie si Supabase possède déjà une session.
                 */

                const {
                    data: { session },
                } =
                    await supabase.auth.getSession();

                if (session) {
                    setSessionReady(true);
                } else {
                    setError(
                        "Cette invitation n'est plus valide. Merci de demander une nouvelle invitation."
                    );
                }
            } catch (err) {
                console.error(
                    "Erreur initialisation invitation:",
                    err
                );

                setError(
                    "Impossible de vérifier cette invitation."
                );
            } finally {
                setCheckingSession(false);
            }
        }

        initializeInvitation();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!sessionReady) {
            setError(
                "Votre invitation n'est pas valide."
            );
            return;
        }

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

        try {
            const supabase = createClient();

            /*
             * Vérification de sécurité :
             * l'utilisateur doit avoir une session active.
             */

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error(
                    "Utilisateur introuvable:",
                    userError
                );

                setError(
                    "Votre session a expiré. Merci de demander une nouvelle invitation."
                );

                setLoading(false);
                return;
            }

            /*
             * L'utilisateur invité est maintenant connecté.
             * On peut définir son mot de passe.
             */

            const { error: updateError } =
                await supabase.auth.updateUser({
                    password,
                });

            if (updateError) {
                console.error(
                    "Erreur updateUser:",
                    updateError
                );

                setError(updateError.message);

                setLoading(false);
                return;
            }

            /*
             * Le compte est maintenant prêt.
             */

            router.replace("/dashboard");
            router.refresh();
        } catch (err) {
            console.error(
                "Erreur création mot de passe:",
                err
            );

            setError(
                "Une erreur est survenue lors de la création du mot de passe."
            );

            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-7 shadow-2xl sm:p-9">

                <div className="text-center">
                    <div className="text-5xl">
                        🎉
                    </div>

                    <h1 className="mt-5 text-3xl font-black text-white">
                        Bienvenue sur KLIKAO
                    </h1>

                    <p className="mt-3 leading-relaxed text-slate-400">
                        Votre invitation a été validée.
                        Choisissez maintenant votre mot de passe.
                    </p>
                </div>

                {checkingSession && (
                    <div className="mt-7 rounded-2xl bg-indigo-500/10 p-4 text-center font-semibold text-indigo-300">
                        Vérification de votre invitation...
                    </div>
                )}

                {!checkingSession && error && (
                    <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold leading-relaxed text-red-400">
                        {error}
                    </div>
                )}

                {!checkingSession &&
                    sessionReady && (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-6"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-300">
                                    Mot de passe
                                </label>

                                <PasswordInput
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="8 caractères minimum"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-300">
                                    Confirmer le mot de passe
                                </label>
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="Confirmez votre mot de passe"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cursor-pointer rounded-2xl bg-indigo-600 px-5 py-4 text-lg font-black text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Activation du compte..."
                                    : "Créer mon mot de passe"}
                            </button>
                        </form>
                    )}
            </div>
        </main>
    );
}
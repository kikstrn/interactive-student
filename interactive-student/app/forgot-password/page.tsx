import Link from "next/link";
import { requestPasswordReset } from "./actions";

type ForgotPasswordPageProps = {
    searchParams: Promise<{
        sent?: string;
        error?: string;
    }>;
};

export default async function ForgotPasswordPage({
    searchParams,
}: ForgotPasswordPageProps) {
    const params = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                        🔑
                    </div>
                    <h1 className="mt-4 text-2xl font-black text-slate-900">
                        Mot de passe oublié
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Saisissez votre adresse email. Vous recevrez un lien pour définir un nouveau mot de passe.
                    </p>
                </div>

                {params.sent ? (
                    <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm font-semibold leading-6 text-emerald-700">
                        Si un compte existe pour cette adresse, un email de réinitialisation vient d&apos;être envoyé.
                    </div>
                ) : (
                    <form action={requestPasswordReset} className="mt-7 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Adresse email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-500"
                        >
                            Envoyer le lien
                        </button>
                    </form>
                )}

                <Link
                    href="/login"
                    className="mt-6 block text-center text-sm font-bold text-slate-500 hover:text-slate-900"
                >
                    ← Retour à la connexion
                </Link>
            </div>
        </main>
    );
}

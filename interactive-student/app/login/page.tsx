import Link from "next/link";
import KlikaoLogo from "@/components/brand/klikao-logo";
import { login } from "./actions";

type LoginPageProps = {
    searchParams: Promise<{
        error?: string;
        confirmed?: string;
        checkEmail?: string;
        passwordUpdated?: string;
    }>;
};

export default async function LoginPage({
    searchParams,
}: LoginPageProps) {
    const params = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <KlikaoLogo
                        href="/"
                        priority
                        variant="auth"
                    />

                    <p className="mt-5 text-sm leading-6 text-slate-500">
                        Connectez-vous à votre espace enseignant.
                    </p>
                </div>

                {params.checkEmail && (
                    <div className="mb-5 rounded-xl bg-sky-50 p-4 text-sm font-semibold text-sky-700">
                        Compte créé. Consultez votre boîte mail pour confirmer votre adresse avant de vous connecter.
                    </div>
                )}

                {params.confirmed && (
                    <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                        Adresse email confirmée. Vous pouvez maintenant vous connecter.
                    </div>
                )}

                {params.passwordUpdated && (
                    <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                        Votre mot de passe a été modifié.
                    </div>
                )}

                {params.error && (
                    <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                        Adresse email ou mot de passe incorrect, ou compte non encore confirmé.
                    </div>
                )}

                <form action={login} className="space-y-5">
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

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <label className="text-sm font-bold text-slate-700">
                                Mot de passe
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-500"
                    >
                        Se connecter
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Pas encore de compte ?{" "}
                    <Link
                        href="/register"
                        className="font-bold text-indigo-600"
                    >
                        Créer un compte
                    </Link>
                </p>
            </div>
        </main>
    );
}

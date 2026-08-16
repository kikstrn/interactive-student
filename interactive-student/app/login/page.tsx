import Link from "next/link";
import { login } from "./actions";

type LoginPageProps = {
    searchParams: Promise<{
        error?: string;
        registered?: string;
    }>;
};

export default async function LoginPage({
    searchParams,
}: LoginPageProps) {
    const params = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Interactive Student
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Connexion à votre espace enseignant
                    </p>
                </div>

                {params.registered && (
                    <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                        Votre compte a été créé. Vous pouvez vous connecter.
                    </div>
                )}

                {params.error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        Adresse email ou mot de passe incorrect.
                    </div>
                )}

                <form action={login} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Adresse email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Mot de passe
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                        Se connecter
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Pas encore de compte ?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-slate-900"
                    >
                        Créer un compte
                    </Link>
                </p>
            </div>
        </main>
    );
}
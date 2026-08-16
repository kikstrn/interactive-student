import Link from "next/link";
import KlikaoLogo from "@/components/brand/klikao-logo";
import { register } from "./actions";

type RegisterPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

export default async function RegisterPage({
    searchParams,
}: RegisterPageProps) {
    const params = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <KlikaoLogo
                        href="/"
                        priority
                        variant="auth"
                    />

                    <h1 className="mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
                        Créer mon compte
                    </h1>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Une confirmation par email sera demandée avant la première connexion.
                    </p>
                </div>

                {params.error && (
                    <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {params.error === "password-too-short"
                            ? "Le mot de passe doit contenir au moins 8 caractères."
                            : params.error === "password-mismatch"
                              ? "Les deux mots de passe ne correspondent pas."
                              : "Impossible de créer le compte."}
                    </div>
                )}

                <form action={register} className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Prénom
                        </label>
                        <input
                            name="firstName"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Nom
                        </label>
                        <input
                            name="lastName"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="sm:col-span-2">
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
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Mot de passe
                        </label>
                        <input
                            name="password"
                            type="password"
                            minLength={8}
                            required
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Confirmer
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            minLength={8}
                            required
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-500"
                        >
                            Créer mon compte
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Vous avez déjà un compte ?{" "}
                    <Link
                        href="/login"
                        className="font-bold text-indigo-600"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        </main>
    );
}

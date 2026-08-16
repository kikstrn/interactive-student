import Link from "next/link";
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
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Interactive Student
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Créez votre espace enseignant
                    </p>
                </div>

                {params.error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        Impossible de créer le compte.
                    </div>
                )}

                <form action={register} className="space-y-5">
                    <div>
                        <label
                            htmlFor="firstName"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Prénom
                        </label>

                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="lastName"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Nom
                        </label>

                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400"
                        />
                    </div>

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
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400" />
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
                            minLength={8}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400" />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                        Créer mon compte
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Vous avez déjà un compte ?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-slate-900"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        </main>
    );
}
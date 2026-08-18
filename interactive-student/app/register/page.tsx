import Link from "next/link";
import KlikaoLogo from "@/components/brand/klikao-logo";
import { requestAccess } from "./actions";

type RegisterPageProps = {
    searchParams: Promise<{
        sent?: string;
        error?: string;
    }>;
};

export default async function RegisterPage({
    searchParams,
}: RegisterPageProps) {
    const params = await searchParams;

    return (
        <main className="klikao-auth-background flex min-h-screen items-center justify-center px-4 py-10">
            <div className="klikao-surface w-full max-w-xl rounded-[2rem] p-8 sm:p-10">
                <div className="flex flex-col items-center text-center">
                    <KlikaoLogo
                        href="/"
                        priority
                        variant="auth"
                    />

                    <h1 className="mt-7 text-2xl font-black text-slate-900 sm:text-3xl">
                        Demander un accès à KLIKAO
                    </h1>

                    <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                        KLIKAO est actuellement accessible sur invitation.
                        Envoyez votre demande et vous recevrez une invitation
                        après validation.
                    </p>
                </div>

                {params.sent && (
                    <div className="mt-7 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-center">
                        <p className="font-black text-teal-800">
                            ✓ Votre demande a bien été envoyée
                        </p>

                        <p className="mt-2 text-sm leading-6 text-teal-700">
                            {params.sent === "already"
                                ? "Une demande est déjà en cours ou a déjà été validée pour cette adresse email."
                                : "Votre demande apparaît maintenant dans l'administration KLIKAO. Vous recevrez une invitation par email après validation."}
                        </p>
                    </div>
                )}

                {params.error && (
                    <div className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
                        {params.error === "missing-fields"
                            ? "Merci de renseigner votre prénom, votre nom et votre adresse email."
                            : params.error === "invalid-email"
                              ? "L'adresse email renseignée n'est pas valide."
                              : params.error === "invalid-grade"
                              ? "Le niveau de classe sélectionné n'est pas valide."
                              : params.error === "save-error"
                                ? "Impossible d'enregistrer votre demande pour le moment."
                                : "Impossible d'envoyer votre demande pour le moment. Merci de réessayer."}
                    </div>
                )}

                {!params.sent && (
                    <form action={requestAccess} className="mt-8 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Prénom *
                            </label>
                            <input
                                name="firstName"
                                required
                                autoComplete="given-name"
                                className="klikao-focus w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Nom *
                            </label>
                            <input
                                name="lastName"
                                required
                                autoComplete="family-name"
                                className="klikao-focus w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:bg-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Adresse email *
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="vous@ecole.fr"
                                className="klikao-focus w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Établissement
                            </label>
                            <input
                                name="school"
                                placeholder="Ex : École Jean Moulin"
                                className="klikao-focus w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Classe principale
                            </label>

                            <select
                                name="grade"
                                defaultValue=""
                                className="klikao-focus w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:bg-white"
                            >
                                <option value="">
                                    Non renseignée
                                </option>
                                <option value="CP">CP</option>
                                <option value="CE1">CE1</option>
                                <option value="CE2">CE2</option>
                                <option value="CM1">CM1</option>
                                <option value="CM2">CM2</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Message
                            </label>
                            <textarea
                                name="message"
                                rows={4}
                                placeholder="Vous pouvez préciser votre classe ou votre besoin..."
                                className="klikao-focus w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3.5 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 active:scale-[0.99]"
                            >
                                ✉️ Envoyer ma demande
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Vous avez déjà un compte ?{" "}
                        <Link
                            href="/login"
                            className="font-black text-indigo-600 transition hover:text-indigo-500"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

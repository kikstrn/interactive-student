import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setTeacherPin } from "./actions";

type SettingsPageProps = {
    searchParams: Promise<{
        saved?: string;
        error?: string;
    }>;
};

export default async function SettingsPage({
    searchParams,
}: SettingsPageProps) {
    const params = await searchParams;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-4xl px-6 py-5">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                        ← Dashboard
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-slate-900">
                        Paramètres
                    </h1>
                </div>
            </header>

            <div className="mx-auto max-w-4xl px-6 py-10">
                <section className="max-w-lg rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        Sécurité du Mode Classe
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Définissez un PIN à 4 chiffres qui sera demandé
                        pour quitter le Mode Classe.
                    </p>

                    {params.saved && (
                        <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                            PIN enregistré avec succès.
                        </div>
                    )}

                    {params.error === "invalid-pin" && (
                        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                            Le PIN doit contenir exactement 4 chiffres.
                        </div>
                    )}

                    {params.error === "pin-mismatch" && (
                        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                            Les deux PIN ne correspondent pas.
                        </div>
                    )}

                    <form
                        action={setTeacherPin}
                        className="mt-6 space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="pin"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Nouveau PIN
                            </label>

                            <input
                                id="pin"
                                name="pin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                required
                                autoComplete="off"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 outline-none focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPin"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Confirmer le PIN
                            </label>

                            <input
                                id="confirmPin"
                                name="confirmPin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                required
                                autoComplete="off"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 outline-none focus:border-slate-400"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                        >
                            Enregistrer le PIN
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
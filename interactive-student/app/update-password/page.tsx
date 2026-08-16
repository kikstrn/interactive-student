import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveNewPassword } from "./actions";

type UpdatePasswordPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

export default async function UpdatePasswordPage({
    searchParams,
}: UpdatePasswordPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=recovery-session");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                        🛡️
                    </div>
                    <h1 className="mt-4 text-2xl font-black text-slate-900">
                        Nouveau mot de passe
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Définissez votre nouveau mot de passe.
                    </p>
                </div>

                {params.error && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {params.error === "too-short"
                            ? "Le mot de passe doit contenir au moins 8 caractères."
                            : params.error === "mismatch"
                              ? "Les deux mots de passe ne correspondent pas."
                              : "Impossible de modifier le mot de passe."}
                    </div>
                )}

                <form action={saveNewPassword} className="mt-7 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Nouveau mot de passe
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
                            Confirmer le mot de passe
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

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-500"
                    >
                        Enregistrer le nouveau mot de passe
                    </button>
                </form>
            </div>
        </main>
    );
}

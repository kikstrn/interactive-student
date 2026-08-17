import KlikaoPageHeader from "@/components/brand/klikao-page-header";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InstallKlikaoButton from "@/components/pwa/install-klikao-button";
import PasswordInput from "@/components/ui/password-input";
import {
    setTeacherPin,
    updatePassword,
    updateProfile,
} from "./actions";

type SettingsPageProps = {
    searchParams: Promise<{
        profileSaved?: string;
        profileError?: string;
        passwordSaved?: string;
        passwordError?: string;
        pinSaved?: string;
        pinError?: string;
        setupPin?: string;
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

    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, pin_configured")
        .eq("id", user.id)
        .single();

    const hasTeacherPin = profile?.pin_configured === true;

    return (
        <main className="min-h-screen bg-slate-50">
            <KlikaoPageHeader
                backHref="/dashboard"
                backLabel="Dashboard"
                title="Paramètres"
                subtitle="Profil et sécurité de votre compte"
            />

            <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10">
                {(params.setupPin === "required" || !hasTeacherPin) && (
                    <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                                🔐
                            </div>

                            <div>
                                <h2 className="text-xl font-black text-amber-950">
                                    Code PIN requis pour le Mode Classe
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-7 text-amber-800">
                                    Avant de lancer le Mode Classe, choisissez un code PIN à 4 chiffres. Il sera demandé pour quitter l&apos;écran élève et revenir à votre espace enseignant.
                                </p>

                                <a
                                    href="#class-mode-pin"
                                    className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-amber-500"
                                >
                                    Configurer mon PIN maintenant ↓
                                </a>
                            </div>
                        </div>
                    </section>
                )}
                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-900">
                            👤 Mon profil
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Modifiez le nom affiché dans votre espace.
                        </p>
                    </div>

                    {params.profileSaved && (
                        <div className="mb-5 rounded-xl bg-teal-50 p-4 text-sm font-semibold text-teal-700">
                            Profil mis à jour.
                        </div>
                    )}

                    {params.profileError && (
                        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                            Impossible de mettre à jour le profil.
                        </div>
                    )}

                    <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Prénom
                            </label>
                            <input
                                name="firstName"
                                defaultValue={profile?.first_name ?? ""}
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
                                defaultValue={profile?.last_name ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Adresse email
                            </label>
                            <input
                                value={profile?.email ?? user.email ?? ""}
                                disabled
                                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                            />
                            <p className="mt-2 text-xs text-slate-400">
                                La modification de l&apos;adresse email pourra être ajoutée séparément avec une nouvelle confirmation email.
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-500"
                            >
                                Enregistrer le profil
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-900">
                            🔐 Mot de passe
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Choisissez un nouveau mot de passe d&apos;au moins 8 caractères.
                        </p>
                    </div>

                    {params.passwordSaved && (
                        <div className="mb-5 rounded-xl bg-teal-50 p-4 text-sm font-semibold text-teal-700">
                            Mot de passe modifié.
                        </div>
                    )}

                    {params.passwordError && (
                        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {params.passwordError === "too-short"
                                ? "Le mot de passe doit contenir au moins 8 caractères."
                                : params.passwordError === "mismatch"
                                    ? "Les deux mots de passe ne correspondent pas."
                                    : "Impossible de modifier le mot de passe."}
                        </div>
                    )}

                    <form action={updatePassword} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Nouveau mot de passe
                            </label>
                            <PasswordInput
                                name="password"
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
                            <PasswordInput
                                name="confirmPassword"
                                minLength={8}
                                required
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-500"
                            >
                                Modifier mon mot de passe
                            </button>
                        </div>
                    </form>
                </section>

                <section
                    id="class-mode-pin"
                    className={`scroll-mt-28 rounded-3xl bg-white p-6 shadow-sm sm:p-8 ${
                        params.setupPin === "required" || !hasTeacherPin
                            ? "ring-2 ring-amber-300"
                            : ""
                    }`}
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-900">
                            🔢 Sécurité du Mode Classe
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Ce PIN est demandé pour quitter le Mode Classe depuis le tableau interactif.
                        </p>
                    </div>

                    {params.pinSaved && (
                        <div className="mb-5 rounded-xl bg-teal-50 p-4 text-sm font-semibold text-teal-700">
                            PIN enregistré. Vous pouvez maintenant utiliser le Mode Classe.
                        </div>
                    )}

                    {params.pinError && (
                        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {params.pinError === "invalid"
                                ? "Le PIN doit contenir exactement 4 chiffres."
                                : params.pinError === "mismatch"
                                    ? "Les deux PIN ne correspondent pas."
                                    : "Impossible d'enregistrer le PIN."}
                        </div>
                    )}

                    <form action={setTeacherPin} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Nouveau PIN
                            </label>
                            <PasswordInput
                                name="pin"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                required
                                autoComplete="off"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.45em] text-slate-900 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Confirmer le PIN
                            </label>
                            <PasswordInput
                                name="confirmPin"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                required
                                autoComplete="off"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.45em] text-slate-900 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-500"
                            >
                                Modifier mon PIN
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-900">
                            📲 Application KLIKAO
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Installez KLIKAO sur votre ordinateur, tablette ou tableau interactif.
                        </p>
                    </div>

                    <InstallKlikaoButton />
                </section>
            </div>
        </main>
    );
}

import Link from "next/link";
import {
    BookOpen,
    Settings,
    LogOut,
    Globe2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "./actions";
import CreateClassForm from "./create-class-form";
import KlikaoLogo from "@/components/brand/klikao-logo";
import ProductTour from "./product-tour";

type DashboardPageProps = {
    searchParams: Promise<{
        welcome?: string;
        tour?: string;
    }>;
};

export default async function DashboardPage({
    searchParams,
}: DashboardPageProps) {
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
        .select("first_name, last_name, pin_configured, onboarding_completed, tutorial_completed, tutorial_skipped, tutorial_step")
        .eq("id", user.id)
        .single();

    if (
        profile?.onboarding_completed ===
        false
    ) {
        redirect("/onboarding");
    }

    const { data: classes } = await supabase
        .from("classes")
        .select(`
            id,
            name,
            grade,
            school_year,
            students(count)
        `)
        .order("created_at", { ascending: false });

    const totalStudents =
        classes?.reduce((total, classItem) => {
            const count = classItem.students?.[0]?.count ?? 0;
            return total + count;
        }, 0) ?? 0;

    const hasTeacherPin = profile?.pin_configured === true;

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
                <div className="mx-auto flex min-h-[78px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <KlikaoLogo
                            href="/dashboard"
                            priority
                            variant="header"
                        />

                        <div className="hidden h-9 w-px bg-slate-200 lg:block" />

                        <div className="hidden lg:block">
                            <p className="text-sm font-bold text-slate-700">
                                Espace enseignant
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Tableau de bord
                            </p>
                        </div>
                    </div>

                    <nav
                        aria-label="Navigation enseignant"
                        className="flex shrink-0 items-center gap-2"
                    >
                        <Link
                            href="/categories"
                            data-tour="exercises"
                            title="Exercices"
                            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md md:w-auto md:gap-2.5 md:px-4"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                                <BookOpen size={17} />
                            </span>
                            <span className="hidden text-sm font-bold md:inline">
                                Exercices
                            </span>
                        </Link>

                        <Link
                            href="/workshop"
                            data-tour="workshop"
                            title="Workshop"
                            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50/70 text-teal-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-100 hover:shadow-md lg:w-auto lg:gap-2.5 lg:px-4"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-teal-600">
                                <Globe2 size={17} />
                            </span>
                            <span className="hidden text-sm font-bold lg:inline">
                                Workshop
                            </span>
                        </Link>

                        <Link
                            href="/settings"
                            data-tour="settings"
                            title="Paramètres"
                            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md xl:w-auto xl:gap-2.5 xl:px-4"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                <Settings size={17} />
                            </span>
                            <span className="hidden text-sm font-bold xl:inline">
                                Paramètres
                            </span>
                        </Link>

                        <form action={logout}>
                            <button
                                type="submit"
                                title="Déconnexion"
                                aria-label="Déconnexion"
                                className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50/70 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 hover:shadow-md 2xl:w-auto 2xl:gap-2.5 2xl:px-4"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-red-500">
                                    <LogOut size={17} />
                                </span>
                                <span className="hidden text-sm font-bold 2xl:inline">
                                    Déconnexion
                                </span>
                            </button>
                        </form>
                    </nav>
                </div>
            </header>

            {params.welcome === "1" && (
                <div className="border-b border-teal-200 bg-teal-50">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                        <p className="font-black text-teal-900">
                            🎉 Votre espace KLIKAO est prêt !
                        </p>
                        <p className="mt-1 text-sm text-teal-700">
                            Un petit tutoriel va maintenant vous présenter les fonctions principales.
                        </p>
                    </div>
                </div>
            )}

            <ProductTour
                autoStart={
                    profile?.tutorial_completed !== true &&
                    profile?.tutorial_skipped !== true
                }
                forceStart={params.tour === "1"}
                initialStep={
                    profile?.tutorial_step ?? 0
                }
            />

            {!hasTeacherPin && (
                <div className="border-b border-amber-200 bg-amber-50">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                                🔐
                            </div>

                            <div>
                                <p className="font-black text-amber-900">
                                    Configurez votre code PIN avant d&apos;utiliser le Mode Classe
                                </p>

                                <p className="mt-1 text-sm leading-6 text-amber-700">
                                    Ce code à 4 chiffres est indispensable pour quitter le Mode Classe depuis un tableau interactif.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/settings?setupPin=required"
                            className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-amber-500"
                        >
                            Configurer mon PIN
                        </Link>
                    </div>
                </div>
            )}

            <div data-tour="dashboard-home" className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Bonjour {profile?.first_name ?? "Professeur"} 👋
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Gérez vos classes et vos élèves.
                        </p>
                    </div>

                    <div data-tour="create-class">
                        <CreateClassForm />
                    </div>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Classes
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {classes?.length ?? 0}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Élèves
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {totalStudents}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Exercices
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            0
                        </p>
                    </div>
                </div>

                <section data-tour="class-list" className="mt-12">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Mes classes
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Sélectionnez une classe pour gérer ses élèves.
                        </p>
                    </div>

                    {!classes || classes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <p className="font-medium text-slate-700">
                                Vous n&apos;avez encore aucune classe.
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Créez votre première classe pour commencer.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {classes.map((classItem) => {
                                const studentCount =
                                    classItem.students?.[0]?.count ?? 0;

                                return (
                                    <Link
                                        key={classItem.id}
                                        href={`/classes/${classItem.id}`}
                                        className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900">
                                                    {classItem.name}
                                                </h4>

                                                {classItem.grade && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {classItem.grade}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                {studentCount} élève
                                                {studentCount > 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        {classItem.school_year && (
                                            <p className="mt-6 text-sm text-slate-500">
                                                Année scolaire :{" "}
                                                {classItem.school_year}
                                            </p>
                                        )}

                                        <div className="mt-6 font-semibold text-slate-900">
                                            Ouvrir la classe →
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
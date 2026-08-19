import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkshopBrowser from "./workshop-browser";
import StarterPackInstaller from "./starter-pack-installer";

type WorkshopPageProps = {
    searchParams: Promise<{
        grade?: string;
        source?: string;
    }>;
};

const allowedGrades = [
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
];

export default async function WorkshopPage({
    searchParams,
}: WorkshopPageProps) {
    const params = await searchParams;

    const selectedGrade =
        typeof params.grade === "string" &&
        allowedGrades.includes(params.grade)
            ? params.grade
            : "";

    const selectedSource =
        params.source === "official" ||
        params.source === "community"
            ? params.source
            : "";

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    let workshopQuery = supabase
        .from("workshop_exercises")
        .select(`
            id,
            author_id,
            author_name,
            category_name,
            category_icon,
            input_type,
            answer_input_type,
            title,
            question,
            level,
            exercise_type,
            choices,
            items_json,
            download_count,
            is_official,
            pack_grade,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    if (selectedGrade) {
        workshopQuery = workshopQuery.eq(
            "pack_grade",
            selectedGrade
        );
    }

    if (selectedSource === "official") {
        workshopQuery = workshopQuery.eq(
            "is_official",
            true
        );
    }

    if (selectedSource === "community") {
        workshopQuery = workshopQuery.eq(
            "is_official",
            false
        );
    }

    const { data: exercises } =
        await workshopQuery;

    const { data: officialPackRows } =
        await supabase
            .from("workshop_exercises")
            .select("id, pack_grade")
            .eq("is_official", true)
            .not("pack_grade", "is", null);

    const packCounts = (
        officialPackRows ?? []
    ).reduce<Record<string, number>>(
        (accumulator, exercise) => {
            const grade =
                exercise.pack_grade;

            if (grade) {
                accumulator[grade] =
                    (accumulator[grade] ??
                        0) + 1;
            }

            return accumulator;
        },
        {}
    );

    const { data: importedWorkshopRows } =
        await supabase
            .from("exercises")
            .select("source_workshop_id")
            .eq("teacher_id", user.id)
            .not(
                "source_workshop_id",
                "is",
                null
            );

    const importedWorkshopIds =
        new Set(
            (importedWorkshopRows ?? [])
                .map(
                    (exercise) =>
                        exercise.source_workshop_id
                )
                .filter(
                    (
                        id
                    ): id is string =>
                        Boolean(id)
                )
        );

    const installedPackCounts = (
        officialPackRows ?? []
    ).reduce<Record<string, number>>(
        (accumulator, exercise) => {
            const grade =
                exercise.pack_grade;

            if (
                grade &&
                importedWorkshopIds.has(
                    exercise.id
                )
            ) {
                accumulator[grade] =
                    (accumulator[grade] ??
                        0) + 1;
            }

            return accumulator;
        },
        {}
    );

    const installedGrades =
        allowedGrades.filter(
            (grade) =>
                (packCounts[grade] ?? 0) >
                    0 &&
                (installedPackCounts[
                    grade
                ] ?? 0) >=
                    (packCounts[grade] ??
                        0)
        );

    const officialCount =
        (exercises ?? []).filter(
            (exercise) =>
                exercise.is_official === true
        ).length;

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <Link
                            href="/categories"
                            className="cursor-pointer text-sm font-bold text-slate-500 hover:text-slate-900"
                        >
                            ← Mes catégories
                        </Link>

                        <h1 className="mt-3 text-3xl font-black text-slate-900">
                            🌐 Workshop
                        </h1>
                    </div>

                    <Link
                        href="/dashboard"
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Dashboard
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-sm sm:p-10">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                                Bibliothèque communautaire
                            </span>

                            <span className="rounded-full bg-amber-300/20 px-4 py-2 text-sm font-bold text-amber-100">
                                ⭐ Packs officiels KLIKAO
                            </span>
                        </div>

                        <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                            Trouvez rapidement de nouveaux exercices
                        </h2>

                        <p className="mt-3 text-lg leading-8 text-indigo-100">
                            Recherchez, filtrez par classe, catégorie, niveau,
                            type ou source, puis ajoutez un exercice directement
                            à votre bibliothèque.
                        </p>
                    </div>
                </section>

                <StarterPackInstaller
                    counts={packCounts}
                    installedGrades={
                        installedGrades
                    }
                />

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">
                                🎒 Packs KLIKAO primaire
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Filtrez les exercices officiels par classe ou
                                affichez uniquement les contributions de la communauté.
                            </p>
                        </div>

                        {officialCount > 0 && (
                            <span className="w-fit rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">
                                ⭐ {officialCount} exercice
                                {officialCount > 1 ? "s" : ""} KLIKAO affiché
                                {officialCount > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    <form
                        method="get"
                        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
                    >
                        <div>
                            <label
                                htmlFor="grade"
                                className="mb-2 block text-sm font-bold text-slate-700"
                            >
                                Classe
                            </label>

                            <select
                                id="grade"
                                name="grade"
                                defaultValue={selectedGrade}
                                className="min-h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            >
                                <option value="">
                                    Toutes les classes
                                </option>
                                <option value="CP">CP</option>
                                <option value="CE1">CE1</option>
                                <option value="CE2">CE2</option>
                                <option value="CM1">CM1</option>
                                <option value="CM2">CM2</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="source"
                                className="mb-2 block text-sm font-bold text-slate-700"
                            >
                                Source
                            </label>

                            <select
                                id="source"
                                name="source"
                                defaultValue={selectedSource}
                                className="min-h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            >
                                <option value="">
                                    Toutes les sources
                                </option>
                                <option value="official">
                                    ⭐ KLIKAO
                                </option>
                                <option value="community">
                                    👩‍🏫 Communauté
                                </option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="min-h-12 cursor-pointer self-end rounded-xl bg-indigo-600 px-6 font-black text-white transition hover:bg-indigo-500"
                        >
                            Filtrer
                        </button>
                    </form>

                    {(selectedGrade || selectedSource) && (
                        <div className="mt-4">
                            <Link
                                href="/workshop"
                                className="cursor-pointer text-sm font-bold text-indigo-600 hover:text-indigo-500"
                            >
                                ✕ Réinitialiser les filtres
                            </Link>
                        </div>
                    )}
                </section>

                <WorkshopBrowser
                    exercises={(exercises ?? []) as never[]}
                    currentUserId={user.id}
                />
            </div>
        </main>
    );
}

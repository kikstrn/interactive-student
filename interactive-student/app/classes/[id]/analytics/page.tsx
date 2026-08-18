import Link from "next/link";
import {
    notFound,
    redirect,
} from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KlikaoPageHeader from "@/components/brand/klikao-page-header";

type AnalyticsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

type StudentRow = {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar: string | null;
    level: string;
};

type ResultRow = {
    id: string;
    student_id: string;
    category_name: string | null;
    category_icon: string | null;
    exercise_type: string;
    is_correct: boolean;
    created_at: string;
};

type StudentStat = StudentRow & {
    total: number;
    correct: number;
    rate: number | null;
};

function percentage(
    correct: number,
    total: number
) {
    if (total === 0) {
        return null;
    }

    return Math.round(
        (correct / total) * 100
    );
}

function rateClass(rate: number | null) {
    if (rate === null) {
        return "text-slate-400";
    }

    if (rate >= 75) {
        return "text-emerald-600";
    }

    if (rate >= 50) {
        return "text-amber-600";
    }

    return "text-red-600";
}

function rateBackground(rate: number | null) {
    if (rate === null) {
        return "bg-slate-200";
    }

    if (rate >= 75) {
        return "bg-emerald-500";
    }

    if (rate >= 50) {
        return "bg-amber-500";
    }

    return "bg-red-500";
}

export default async function ClassAnalyticsPage({
    params,
}: AnalyticsPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: classItem } = await supabase
        .from("classes")
        .select(`
            id,
            name,
            grade,
            school_year,
            teacher_id
        `)
        .eq("id", id)
        .eq("teacher_id", user.id)
        .single();

    if (!classItem) {
        notFound();
    }

    const { data: studentsData } =
        await supabase
            .from("students")
            .select(`
                id,
                first_name,
                last_name,
                avatar,
                level
            `)
            .eq("class_id", id)
            .order("first_name", {
                ascending: true,
            });

    const students =
        (studentsData ?? []) as StudentRow[];

    const { data: resultsData } =
        await supabase
            .from("student_exercise_results")
            .select(`
                id,
                student_id,
                category_name,
                category_icon,
                exercise_type,
                is_correct,
                created_at
            `)
            .eq("teacher_id", user.id)
            .eq("class_id", id)
            .order("created_at", {
                ascending: false,
            });

    const results =
        (resultsData ?? []) as ResultRow[];

    const totalAnswers = results.length;
    const correctAnswers = results.filter(
        (result) => result.is_correct
    ).length;
    const classRate = percentage(
        correctAnswers,
        totalAnswers
    );

    const activeStudents = new Set(
        results.map(
            (result) => result.student_id
        )
    ).size;

    const studentStats: StudentStat[] =
        students
            .map((student) => {
                const studentResults =
                    results.filter(
                        (result) =>
                            result.student_id ===
                            student.id
                    );

                const correct =
                    studentResults.filter(
                        (result) =>
                            result.is_correct
                    ).length;

                return {
                    ...student,
                    total:
                        studentResults.length,
                    correct,
                    rate: percentage(
                        correct,
                        studentResults.length
                    ),
                };
            })
            .sort((a, b) => {
                if (
                    a.rate === null &&
                    b.rate === null
                ) {
                    return a.first_name.localeCompare(
                        b.first_name,
                        "fr"
                    );
                }

                if (a.rate === null) return 1;
                if (b.rate === null) return -1;

                return b.rate - a.rate;
            });

    const categories = new Map<
        string,
        {
            name: string;
            icon: string | null;
            total: number;
            correct: number;
        }
    >();

    for (const result of results) {
        const name =
            result.category_name ??
            "Sans catégorie";

        const current =
            categories.get(name) ?? {
                name,
                icon:
                    result.category_icon,
                total: 0,
                correct: 0,
            };

        current.total += 1;

        if (result.is_correct) {
            current.correct += 1;
        }

        categories.set(
            name,
            current
        );
    }

    const categoryStats =
        Array.from(categories.values())
            .map((category) => ({
                ...category,
                rate:
                    percentage(
                        category.correct,
                        category.total
                    ) ?? 0,
            }))
            .sort(
                (a, b) =>
                    b.total - a.total
            );

    const strongCategories =
        categoryStats
            .filter(
                (category) =>
                    category.total >= 5 &&
                    category.rate >= 75
            )
            .slice(0, 3);

    const weakCategories =
        categoryStats
            .filter(
                (category) =>
                    category.total >= 5 &&
                    category.rate < 60
            )
            .sort(
                (a, b) =>
                    a.rate - b.rate
            )
            .slice(0, 3);

    const needsAttention =
        studentStats
            .filter(
                (student) =>
                    student.total >= 5 &&
                    student.rate !== null &&
                    student.rate < 60
            )
            .sort(
                (a, b) =>
                    (a.rate ?? 100) -
                    (b.rate ?? 100)
            )
            .slice(0, 5);

    return (
        <main className="min-h-screen bg-slate-50">
            <KlikaoPageHeader
                backHref={`/classes/${id}`}
                backLabel={classItem.name}
                title="Statistiques de la classe"
                subtitle={[
                    classItem.grade,
                    classItem.school_year,
                ]
                    .filter(Boolean)
                    .join(" · ")}
            >
                <Link
                    href={`/classes/${id}/play`}
                    className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-500"
                >
                    ▶ Mode Classe
                </Link>
            </KlikaoPageHeader>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon="🎯"
                        label="Réussite de la classe"
                        value={
                            classRate === null
                                ? "—"
                                : `${classRate} %`
                        }
                    />

                    <StatCard
                        icon="✏️"
                        label="Réponses enregistrées"
                        value={`${totalAnswers}`}
                    />

                    <StatCard
                        icon="✅"
                        label="Bonnes réponses"
                        value={`${correctAnswers}`}
                    />

                    <StatCard
                        icon="👩‍🎓"
                        label="Élèves actifs"
                        value={`${activeStudents} / ${students.length}`}
                    />
                </section>

                {totalAnswers === 0 ? (
                    <section className="mt-8 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                        <div className="text-6xl">
                            📊
                        </div>

                        <h2 className="mt-5 text-2xl font-black text-slate-900">
                            Pas encore de statistiques
                        </h2>

                        <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-500">
                            Les données apparaîtront automatiquement dès que les élèves répondront à des exercices en Mode Classe.
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="mt-8 grid gap-6 lg:grid-cols-2">
                            <InsightCard
                                title="💪 Points forts de la classe"
                                description="Matières avec au moins 5 réponses et 75 % de réussite."
                                emptyText="Pas encore assez de données pour identifier un point fort."
                                items={strongCategories.map(
                                    (category) => ({
                                        key:
                                            category.name,
                                        title: `${
                                            category.icon ??
                                            "📚"
                                        } ${
                                            category.name
                                        }`,
                                        detail: `${category.rate} % de réussite · ${category.total} réponses`,
                                    })
                                )}
                                tone="success"
                            />

                            <InsightCard
                                title="🎯 À travailler"
                                description="Matières avec au moins 5 réponses et moins de 60 % de réussite."
                                emptyText="Aucune difficulté de classe significative détectée."
                                items={weakCategories.map(
                                    (category) => ({
                                        key:
                                            category.name,
                                        title: `${
                                            category.icon ??
                                            "📚"
                                        } ${
                                            category.name
                                        }`,
                                        detail: `${category.rate} % de réussite · ${category.total} réponses`,
                                    })
                                )}
                                tone="warning"
                            />
                        </section>

                        {needsAttention.length >
                            0 && (
                            <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                                <div>
                                    <h2 className="text-xl font-black text-amber-950">
                                        👀 Élèves à accompagner
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-amber-800">
                                        Élèves ayant au moins 5 réponses enregistrées et moins de 60 % de réussite.
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {needsAttention.map(
                                        (student) => (
                                            <Link
                                                key={
                                                    student.id
                                                }
                                                href={`/classes/${id}/students/${student.id}/progress`}
                                                className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-3xl">
                                                    {student.avatar ??
                                                        "🙂"}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-black text-slate-900">
                                                        {
                                                            student.first_name
                                                        }{" "}
                                                        {student.last_name ??
                                                            ""}
                                                    </p>

                                                    <p className="text-sm font-bold text-amber-700">
                                                        {
                                                            student.rate
                                                        }{" "}
                                                        % de réussite
                                                    </p>
                                                </div>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Résultats par matière
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Vue globale de toutes les réponses de la classe.
                                </p>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {categoryStats.map(
                                    (category) => (
                                        <div
                                            key={
                                                category.name
                                            }
                                            className="rounded-2xl border border-slate-200 p-5"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {category.icon ??
                                                            "📚"}
                                                    </span>

                                                    <div>
                                                        <p className="font-black text-slate-900">
                                                            {
                                                                category.name
                                                            }
                                                        </p>

                                                        <p className="text-xs font-semibold text-slate-500">
                                                            {
                                                                category.correct
                                                            }{" "}
                                                            /{" "}
                                                            {
                                                                category.total
                                                            }{" "}
                                                            réussies
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`text-xl font-black ${rateClass(
                                                        category.rate
                                                    )}`}
                                                >
                                                    {
                                                        category.rate
                                                    }{" "}
                                                    %
                                                </span>
                                            </div>

                                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full ${rateBackground(
                                                        category.rate
                                                    )}`}
                                                    style={{
                                                        width: `${category.rate}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Progression des élèves
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Cliquez sur un élève pour voir son historique détaillé.
                                </p>
                            </div>

                            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                                <div className="hidden grid-cols-[1fr_130px_130px] gap-4 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-400 sm:grid">
                                    <span>Élève</span>
                                    <span className="text-center">
                                        Réponses
                                    </span>
                                    <span className="text-right">
                                        Réussite
                                    </span>
                                </div>

                                {studentStats.map(
                                    (
                                        student,
                                        index
                                    ) => (
                                        <Link
                                            key={
                                                student.id
                                            }
                                            href={`/classes/${id}/students/${student.id}/progress`}
                                            className={`grid cursor-pointer gap-4 px-5 py-4 transition hover:bg-indigo-50/50 sm:grid-cols-[1fr_130px_130px] sm:items-center ${
                                                index > 0
                                                    ? "border-t border-slate-100"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                                                    {student.avatar ??
                                                        "🙂"}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-black text-slate-900">
                                                        {
                                                            student.first_name
                                                        }{" "}
                                                        {student.last_name ??
                                                            ""}
                                                    </p>

                                                    <p className="text-xs font-semibold text-slate-400 sm:hidden">
                                                        {
                                                            student.total
                                                        }{" "}
                                                        réponse
                                                        {student.total >
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="hidden text-center font-bold text-slate-600 sm:block">
                                                {
                                                    student.total
                                                }
                                            </p>

                                            <p
                                                className={`text-left text-xl font-black sm:text-right ${rateClass(
                                                    student.rate
                                                )}`}
                                            >
                                                {student.rate ===
                                                null
                                                    ? "—"
                                                    : `${student.rate} %`}
                                            </p>
                                        </Link>
                                    )
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-3xl">
                {icon}
            </div>

            <p className="mt-4 text-sm font-bold text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
                {value}
            </p>
        </div>
    );
}

function InsightCard({
    title,
    description,
    emptyText,
    items,
    tone,
}: {
    title: string;
    description: string;
    emptyText: string;
    items: Array<{
        key: string;
        title: string;
        detail: string;
    }>;
    tone: "success" | "warning";
}) {
    const success =
        tone === "success";

    return (
        <div
            className={`rounded-3xl border p-6 sm:p-8 ${
                success
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
            }`}
        >
            <h2
                className={`text-xl font-black ${
                    success
                        ? "text-emerald-950"
                        : "text-amber-950"
                }`}
            >
                {title}
            </h2>

            <p
                className={`mt-1 text-sm leading-6 ${
                    success
                        ? "text-emerald-700"
                        : "text-amber-700"
                }`}
            >
                {description}
            </p>

            {items.length === 0 ? (
                <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-slate-500">
                    {emptyText}
                </p>
            ) : (
                <div className="mt-5 space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="rounded-2xl bg-white p-4 shadow-sm"
                        >
                            <p className="font-black text-slate-900">
                                {item.title}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                {item.detail}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

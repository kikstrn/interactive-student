import Link from "next/link";
import {
    notFound,
    redirect,
} from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KlikaoPageHeader from "@/components/brand/klikao-page-header";

type ProgressPageProps = {
    params: Promise<{
        id: string;
        studentId: string;
    }>;
};

type ResultRow = {
    id: string;
    exercise_title: string | null;
    exercise_type: string;
    category_name: string | null;
    category_icon: string | null;
    prompt_snapshot: string;
    student_answer: string | null;
    expected_answer: string | null;
    is_correct: boolean;
    created_at: string;
};

const typeLabels: Record<string, string> = {
    question: "Question",
    qcm: "QCM",
    voice: "🔊 Écoute",
    oral: "Oral",
    challenge: "Défi",
};

function percentage(
    correct: number,
    total: number
) {
    if (total === 0) return 0;

    return Math.round(
        (correct / total) * 100
    );
}

export default async function StudentProgressPage({
    params,
}: ProgressPageProps) {
    const { id, studentId } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: classItem } = await supabase
        .from("classes")
        .select("id, name, teacher_id")
        .eq("id", id)
        .eq("teacher_id", user.id)
        .single();

    if (!classItem) {
        notFound();
    }

    const { data: student } = await supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            level,
            avatar,
            class_id
        `)
        .eq("id", studentId)
        .eq("class_id", id)
        .single();

    if (!student) {
        notFound();
    }

    const { data } = await supabase
        .from("student_exercise_results")
        .select(`
            id,
            exercise_title,
            exercise_type,
            category_name,
            category_icon,
            prompt_snapshot,
            student_answer,
            expected_answer,
            is_correct,
            created_at
        `)
        .eq("teacher_id", user.id)
        .eq("student_id", studentId)
        .eq("class_id", id)
        .order("created_at", {
            ascending: false,
        });

    const results =
        (data ?? []) as ResultRow[];

    const total = results.length;
    const correct = results.filter(
        (result) => result.is_correct
    ).length;
    const successRate = percentage(
        correct,
        total
    );

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

        categories.set(name, current);
    }

    const categoryStats = Array.from(
        categories.values()
    ).sort(
        (a, b) =>
            b.total - a.total
    );

    const strongCategories =
        categoryStats
            .map((category) => ({
                ...category,
                rate: percentage(
                    category.correct,
                    category.total
                ),
            }))
            .filter(
                (category) =>
                    category.total >= 3 &&
                    category.rate >= 75
            )
            .sort(
                (a, b) =>
                    b.rate - a.rate
            )
            .slice(0, 3);

    const weakCategories =
        categoryStats
            .map((category) => ({
                ...category,
                rate: percentage(
                    category.correct,
                    category.total
                ),
            }))
            .filter(
                (category) =>
                    category.total >= 3 &&
                    category.rate < 60
            )
            .sort(
                (a, b) =>
                    a.rate - b.rate
            )
            .slice(0, 3);

    const recentResults =
        results.slice(0, 30);

    return (
        <main className="min-h-screen bg-slate-50">
            <KlikaoPageHeader
                backHref={`/classes/${id}`}
                backLabel={classItem.name}
                title={`Progression de ${student.first_name}`}
                subtitle="Résultats enregistrés en Mode Classe"
            />

            <div className="mx-auto max-w-7xl px-6 py-10">
                <section className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div className="flex items-center gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-indigo-50 text-5xl">
                            {student.avatar ?? "🙂"}
                        </div>

                        <div>
                            <h1 className="text-2xl font-black text-slate-900">
                                {student.first_name}{" "}
                                {student.last_name ?? ""}
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                {total === 0
                                    ? "Aucun résultat enregistré pour le moment"
                                    : `${total} réponse${total > 1 ? "s" : ""} enregistrée${total > 1 ? "s" : ""}`}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/classes/${id}/play/${studentId}`}
                        className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 px-5 font-black text-white transition hover:bg-indigo-500"
                    >
                        ▶ Faire travailler l&apos;élève
                    </Link>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-3">
                    <StatCard
                        icon="🎯"
                        label="Réussite"
                        value={
                            total > 0
                                ? `${successRate} %`
                                : "—"
                        }
                    />
                    <StatCard
                        icon="✅"
                        label="Bonnes réponses"
                        value={`${correct}`}
                    />
                    <StatCard
                        icon="✏️"
                        label="Exercices réalisés"
                        value={`${total}`}
                    />
                </section>

                {total === 0 ? (
                    <section className="mt-8 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                        <div className="text-6xl">
                            📊
                        </div>

                        <h2 className="mt-5 text-xl font-black text-slate-900">
                            La progression apparaîtra ici
                        </h2>

                        <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-500">
                            Dès que {student.first_name} répondra à des exercices en Mode Classe, KLIKAO enregistrera automatiquement ses réussites et ses erreurs.
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="mt-8 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
                                <h2 className="text-xl font-black text-emerald-950">
                                    💪 Points forts
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-emerald-700">
                                    Matières avec au moins 3 réponses et 75 % de réussite.
                                </p>

                                {strongCategories.length === 0 ? (
                                    <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-slate-500">
                                        Pas encore assez de données pour identifier un point fort.
                                    </p>
                                ) : (
                                    <div className="mt-5 space-y-3">
                                        {strongCategories.map(
                                            (category) => (
                                                <div
                                                    key={
                                                        category.name
                                                    }
                                                    className="rounded-2xl bg-white p-4 shadow-sm"
                                                >
                                                    <p className="font-black text-slate-900">
                                                        {category.icon ??
                                                            "📚"}{" "}
                                                        {
                                                            category.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-emerald-700">
                                                        {
                                                            category.rate
                                                        }{" "}
                                                        % de réussite
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                                <h2 className="text-xl font-black text-amber-950">
                                    🎯 À travailler
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-amber-700">
                                    Matières avec au moins 3 réponses et moins de 60 % de réussite.
                                </p>

                                {weakCategories.length === 0 ? (
                                    <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-slate-500">
                                        Aucune difficulté significative détectée pour le moment.
                                    </p>
                                ) : (
                                    <div className="mt-5 space-y-3">
                                        {weakCategories.map(
                                            (category) => (
                                                <div
                                                    key={
                                                        category.name
                                                    }
                                                    className="rounded-2xl bg-white p-4 shadow-sm"
                                                >
                                                    <p className="font-black text-slate-900">
                                                        {category.icon ??
                                                            "📚"}{" "}
                                                        {
                                                            category.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-amber-700">
                                                        {
                                                            category.rate
                                                        }{" "}
                                                        % de réussite
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Progression par matière
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Le taux est calculé à partir de toutes les réponses enregistrées.
                                </p>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {categoryStats.map(
                                    (category) => {
                                        const rate =
                                            percentage(
                                                category.correct,
                                                category.total
                                            );

                                        return (
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

                                                    <span className={`text-xl font-black ${
                                                        rate >= 75
                                                            ? "text-emerald-600"
                                                            : rate >= 50
                                                              ? "text-amber-600"
                                                              : "text-red-600"
                                                    }`}>
                                                        {rate} %
                                                    </span>
                                                </div>

                                                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-indigo-500"
                                                        style={{
                                                            width: `${rate}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </section>

                        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Historique récent
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Les 30 dernières réponses de l&apos;élève.
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                {recentResults.map(
                                    (result) => (
                                        <article
                                            key={
                                                result.id
                                            }
                                            className={`rounded-2xl border p-4 sm:p-5 ${
                                                result.is_correct
                                                    ? "border-emerald-100 bg-emerald-50/50"
                                                    : "border-red-100 bg-red-50/50"
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-black text-slate-900">
                                                            {result.is_correct
                                                                ? "✅"
                                                                : "❌"}{" "}
                                                            {result.category_icon ??
                                                                "📚"}{" "}
                                                            {result.category_name ??
                                                                "Exercice"}
                                                        </span>

                                                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                            {typeLabels[
                                                                result.exercise_type
                                                            ] ??
                                                                result.exercise_type}
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 font-semibold leading-6 text-slate-700">
                                                        {
                                                            result.prompt_snapshot
                                                        }
                                                    </p>

                                                    {(result.student_answer ||
                                                        result.expected_answer) && (
                                                        <div className="mt-2 text-sm text-slate-600">
                                                            {result.student_answer && (
                                                                <span>
                                                                    Réponse :{" "}
                                                                    <strong>
                                                                        {
                                                                            result.student_answer
                                                                        }
                                                                    </strong>
                                                                </span>
                                                            )}

                                                            {!result.is_correct &&
                                                                result.expected_answer && (
                                                                    <span className="ml-3">
                                                                        Attendu :{" "}
                                                                        <strong>
                                                                            {
                                                                                result.expected_answer
                                                                            }
                                                                        </strong>
                                                                    </span>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>

                                                <time className="shrink-0 text-xs font-semibold text-slate-400">
                                                    {new Intl.DateTimeFormat(
                                                        "fr-FR",
                                                        {
                                                            dateStyle:
                                                                "short",
                                                            timeStyle:
                                                                "short",
                                                        }
                                                    ).format(
                                                        new Date(
                                                            result.created_at
                                                        )
                                                    )}
                                                </time>
                                            </div>
                                        </article>
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

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

function countByStatus(
    profiles: Array<{
        access_status?: string | null;
    }>,
    status: string
) {
    return profiles.filter(
        (profile) =>
            profile.access_status ===
            status
    ).length;
}

export default async function AdminPage() {
    const admin =
        createAdminClient();

    const [
        profilesResult,
        classesResult,
        studentsResult,
        exercisesResult,
        accessRequestsResult,
    ] = await Promise.all([
        admin
            .from("profiles")
            .select(`
                id,
                email,
                first_name,
                last_name,
                access_status,
                is_admin,
                created_at
            `)
            .order("created_at", {
                ascending: false,
            }),
        admin
            .from("classes")
            .select("id", {
                count: "exact",
                head: true,
            }),
        admin
            .from("students")
            .select("id", {
                count: "exact",
                head: true,
            }),
        admin
            .from("exercises")
            .select("id", {
                count: "exact",
                head: true,
            }),
        admin
            .from("access_requests")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("status", "pending"),
    ]);

    const profiles =
        profilesResult.data ?? [];

    const teachers =
        profiles.filter(
            (profile) =>
                profile.is_admin !== true
        );

    const activeTeachers =
        countByStatus(
            teachers,
            "active"
        );

    const invitedTeachers =
        countByStatus(
            teachers,
            "invited"
        );

    const suspendedTeachers =
        countByStatus(
            teachers,
            "suspended"
        );

    const recentTeachers =
        teachers.slice(0, 6);

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-indigo-500">
                        KLIKAO
                    </p>

                    <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                        Dashboard administrateur
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Gérez les accès, les professeurs et l&apos;activité globale de KLIKAO.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/requests"
                        className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 px-5 font-black text-indigo-700 transition hover:bg-indigo-100"
                    >
                        📥 Voir les demandes
                    </Link>

                    <Link
                        href="/admin/teachers"
                        className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 px-5 font-black text-white transition hover:bg-indigo-500"
                    >
                        + Inviter un professeur
                    </Link>
                </div>
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    icon="👩‍🏫"
                    label="Professeurs"
                    value={`${teachers.length}`}
                />

                <StatCard
                    icon="✅"
                    label="Actifs"
                    value={`${activeTeachers}`}
                />

                <StatCard
                    icon="✉️"
                    label="Invitations"
                    value={`${invitedTeachers}`}
                />

                <StatCard
                    icon="⛔"
                    label="Suspendus"
                    value={`${suspendedTeachers}`}
                />

                <StatCard
                    icon="📥"
                    label="Demandes en attente"
                    value={`${accessRequestsResult.count ?? 0}`}
                />
            </section>

            <section className="mt-4 grid gap-4 sm:grid-cols-3">
                <StatCard
                    icon="🏫"
                    label="Classes"
                    value={`${
                        classesResult.count ??
                        0
                    }`}
                />

                <StatCard
                    icon="🧒"
                    label="Élèves"
                    value={`${
                        studentsResult.count ??
                        0
                    }`}
                />

                <StatCard
                    icon="✏️"
                    label="Exercices"
                    value={`${
                        exercisesResult.count ??
                        0
                    }`}
                />
            </section>

            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            Derniers professeurs
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Comptes créés récemment.
                        </p>
                    </div>

                    <Link
                        href="/admin/teachers"
                        className="cursor-pointer text-sm font-black text-indigo-600 hover:text-indigo-500"
                    >
                        Voir tout →
                    </Link>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                    {recentTeachers.length ===
                    0 ? (
                        <p className="py-8 text-center text-slate-400">
                            Aucun professeur pour le moment.
                        </p>
                    ) : (
                        recentTeachers.map(
                            (teacher) => (
                                <div
                                    key={
                                        teacher.id
                                    }
                                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-black text-slate-900">
                                            {teacher.first_name ||
                                                teacher.last_name
                                                ? `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim()
                                                : "Compte invité"}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {teacher.email ??
                                                "Email indisponible"}
                                        </p>
                                    </div>

                                    <StatusBadge
                                        status={
                                            teacher.access_status ??
                                            "invited"
                                        }
                                    />
                                </div>
                            )
                        )
                    )}
                </div>
            </section>
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

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const styles: Record<
        string,
        string
    > = {
        active:
            "bg-emerald-50 text-emerald-700",
        invited:
            "bg-amber-50 text-amber-700",
        suspended:
            "bg-red-50 text-red-700",
        cancelled:
            "bg-slate-100 text-slate-600",
    };

    const labels: Record<
        string,
        string
    > = {
        active: "Actif",
        invited: "Invité",
        suspended: "Suspendu",
        cancelled: "Annulé",
    };

    return (
        <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-black ${
                styles[status] ??
                styles.invited
            }`}
        >
            {labels[status] ?? status}
        </span>
    );
}

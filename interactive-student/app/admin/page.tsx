import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type ProfileRow = {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    access_status: string | null;
    is_admin: boolean | null;
    created_at: string | null;
};

function countByStatus(
    profiles: ProfileRow[],
    status: string
) {
    return profiles.filter(
        (profile) =>
            (profile.access_status ??
                "active") === status
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
        supportTicketsResult,
    ] = await Promise.all([
        admin
            .from("profiles")
            .select("*")
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

        admin
            .from("support_tickets")
            .select("id", {
                count: "exact",
                head: true,
            })
            .in("status", [
                "new",
                "in_progress",
            ]),
    ]);

    console.log(
        "ADMIN PROFILES DATA:",
        profilesResult.data
    );
    console.log(
        "ADMIN PROFILES ERROR:",
        profilesResult.error
    );
    console.log(
        "ADMIN PROFILES COUNT:",
        profilesResult.data?.length
    );

    if (profilesResult.error) {
        console.error(
            "Erreur chargement profiles admin:",
            profilesResult.error
        );

        throw new Error(
            `Impossible de charger les profils : ${profilesResult.error.message}`
        );
    }

    const accounts =
        (profilesResult.data ??
            []) as ProfileRow[];

    const admins = accounts.filter(
        (profile) =>
            profile.is_admin === true
    );

    const teachers = accounts.filter(
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

    const recentAccounts =
        accounts.slice(0, 8);

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
                        href="/admin/tickets"
                        className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 px-5 font-black text-violet-700 transition hover:bg-violet-100"
                    >
                        🎫 Voir les tickets
                    </Link>

                    <Link
                        href="/admin/teachers"
                        className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 px-5 font-black text-white transition hover:bg-indigo-500"
                    >
                        👩‍🏫 Gérer les professeurs
                    </Link>
                </div>
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    icon="👥"
                    label="Comptes au total"
                    value={`${accounts.length}`}
                />

                <StatCard
                    icon="👩‍🏫"
                    label="Professeurs"
                    value={`${teachers.length}`}
                />

                <StatCard
                    icon="🛡️"
                    label="Administrateurs"
                    value={`${admins.length}`}
                />

                <StatCard
                    icon="📥"
                    label="Demandes en attente"
                    value={`${
                        accessRequestsResult.count ??
                        0
                    }`}
                />

                <StatCard
                    icon="🎫"
                    label="Tickets ouverts"
                    value={`${
                        supportTicketsResult.count ??
                        0
                    }`}
                />
            </section>

            <section className="mt-4 grid gap-4 sm:grid-cols-3">
                <StatCard
                    icon="✅"
                    label="Professeurs actifs"
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
                            Comptes KLIKAO
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Tous les comptes présents dans public.profiles.
                        </p>
                    </div>

                    <Link
                        href="/admin/teachers"
                        className="cursor-pointer text-sm font-black text-indigo-600 hover:text-indigo-500"
                    >
                        Gérer →
                    </Link>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                    {recentAccounts.length ===
                    0 ? (
                        <p className="py-8 text-center text-slate-400">
                            Aucun compte pour le moment.
                        </p>
                    ) : (
                        recentAccounts.map(
                            (account) => (
                                <div
                                    key={
                                        account.id
                                    }
                                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-black text-slate-900">
                                                {account.first_name ||
                                                account.last_name
                                                    ? `${account.first_name ?? ""} ${account.last_name ?? ""}`.trim()
                                                    : "Compte KLIKAO"}
                                            </p>

                                            {account.is_admin ===
                                                true && (
                                                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-700">
                                                    🛡️ Admin
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {account.email ??
                                                "Email indisponible"}
                                        </p>
                                    </div>

                                    <StatusBadge
                                        status={
                                            account.access_status ??
                                            "active"
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
                styles.active
            }`}
        >
            {labels[status] ?? status}
        </span>
    );
}

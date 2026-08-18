import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KlikaoLogo from "@/components/brand/klikao-logo";
import AdminPushNotifications from "./admin-push-notifications";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase =
        await createClient();

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select(`
                first_name,
                last_name,
                is_admin
            `)
            .eq("id", user.id)
            .single();

    if (
        profile?.is_admin !==
        true
    ) {
        redirect("/dashboard");
    }

    const {
        count: newTicketCount,
    } = await supabase
        .from("support_tickets")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("status", "new");

    const newTickets =
        newTicketCount ?? 0;

    const navClass =
        "relative flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 sm:text-sm";

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                            <KlikaoLogo
                                href="/admin"
                                priority
                                className="h-9 shrink-0 sm:h-11"
                            />

                            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500 sm:text-xs">
                                    Administration
                                </p>

                                <p className="truncate text-xs font-bold text-slate-600 sm:text-sm">
                                    {profile.first_name ??
                                        ""}{" "}
                                    {profile.last_name ??
                                        ""}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <AdminPushNotifications />

                            <Link
                                href="/dashboard"
                                title="Espace enseignant"
                                className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-3 text-sm font-black text-white transition hover:bg-indigo-500 sm:px-4"
                            >
                                <span className="sm:hidden">
                                    ←
                                </span>
                                <span className="hidden sm:inline">
                                    ← Espace enseignant
                                </span>
                            </Link>
                        </div>
                    </div>

                    <nav className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                        <Link
                            href="/admin"
                            className={navClass}
                        >
                            📊
                            <span>Vue globale</span>
                        </Link>

                        <Link
                            href="/admin/teachers"
                            className={navClass}
                        >
                            👩‍🏫
                            <span>Professeurs</span>
                        </Link>

                        <Link
                            href="/admin/requests"
                            className={navClass}
                        >
                            📥
                            <span>Demandes</span>
                        </Link>

                        <Link
                            href="/admin/tickets"
                            className={navClass}
                        >
                            🎫
                            <span>Tickets</span>

                            {newTickets >
                                0 && (
                                <span className="flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                                    {newTickets >
                                    99
                                        ? "99+"
                                        : newTickets}
                                </span>
                            )}
                        </Link>
                    </nav>
                </div>
            </header>

            {children}
        </div>
    );
}

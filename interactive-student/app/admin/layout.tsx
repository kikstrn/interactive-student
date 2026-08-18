import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KlikaoLogo from "@/components/brand/klikao-logo";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select(`
            first_name,
            last_name,
            is_admin
        `)
        .eq("id", user.id)
        .single();

    if (profile?.is_admin !== true) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <KlikaoLogo
                            href="/admin"
                            priority
                            className="h-10 sm:h-12"
                        />

                        <div className="hidden h-10 w-px bg-slate-200 sm:block" />

                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                                Administration
                            </p>

                            <p className="text-sm font-bold text-slate-600">
                                {profile.first_name ??
                                    ""}{" "}
                                {profile.last_name ??
                                    ""}
                            </p>
                        </div>
                    </div>

                    <nav className="flex flex-wrap gap-2">
                        <Link
                            href="/admin"
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            📊 Vue globale
                        </Link>

                        <Link
                            href="/admin/teachers"
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            👩‍🏫 Professeurs
                        </Link>

                        <Link
                            href="/admin/requests"
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            📥 Demandes
                        </Link>

                        <Link
                            href="/admin/tickets"
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            🎫 Tickets
                        </Link>

                        <Link
                            href="/dashboard"
                            className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-500"
                        >
                            ← Espace enseignant
                        </Link>
                    </nav>
                </div>
            </header>

            {children}
        </div>
    );
}

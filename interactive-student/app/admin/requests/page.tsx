import { createAdminClient } from "@/lib/supabase/admin";
import AccessRequestsManager from "./access-requests-manager";

export default async function AdminRequestsPage() {
    const admin =
        createAdminClient();

    const { data } = await admin
        .from("access_requests")
        .select(`
            id,
            first_name,
            last_name,
            email,
            school,
            requested_grade,
            message,
            status,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-indigo-500">
                    Administration
                </p>

                <h1 className="mt-2 text-3xl font-black text-slate-900">
                    Demandes d&apos;accès
                </h1>

                <p className="mt-2 text-slate-500">
                    Validez les nouveaux professeurs avant l&apos;envoi de leur invitation KLIKAO.
                </p>
            </div>

            <div className="mt-8">
                <AccessRequestsManager
                    requests={
                        (data ?? []) as never[]
                    }
                />
            </div>
        </main>
    );
}

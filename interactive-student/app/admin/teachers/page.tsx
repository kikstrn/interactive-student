import { createAdminClient } from "@/lib/supabase/admin";
import TeachersManager from "./teachers-manager";

export default async function AdminTeachersPage() {
    const admin =
        createAdminClient();

    const [
        profilesResult,
        usersResult,
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
                primary_grade,
                onboarding_completed,
                subscription_status,
                trial_started_at,
                trial_ends_at,
                created_at
            `)
            .order("created_at", {
                ascending: false,
            }),
        admin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
        }),
    ]);

    const authUsers =
        usersResult.data?.users ?? [];

    const authById = new Map(
        authUsers.map((user) => [
            user.id,
            user,
        ])
    );

    const teachers =
        (profilesResult.data ?? [])
            .filter(
                (profile) =>
                    profile.is_admin !==
                    true
            )
            .map((profile) => {
                const authUser =
                    authById.get(
                        profile.id
                    );

                return {
                    id: profile.id,
                    email:
                        profile.email ??
                        authUser?.email ??
                        "",
                    first_name:
                        profile.first_name,
                    last_name:
                        profile.last_name,
                    access_status:
                        profile.access_status ??
                        "invited",
                    created_at:
                        profile.created_at,
                    last_sign_in_at:
                        authUser
                            ?.last_sign_in_at ??
                        null,
                    primary_grade:
                        profile.primary_grade,
                    onboarding_completed:
                        profile.onboarding_completed ??
                        false,
                    subscription_status:
                        profile.subscription_status ??
                        "none",
                    trial_started_at:
                        profile.trial_started_at ??
                        null,
                    trial_ends_at:
                        profile.trial_ends_at ??
                        null,
                };
            });

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-indigo-500">
                    Administration
                </p>

                <h1 className="mt-2 text-3xl font-black text-slate-900">
                    Gestion des professeurs
                </h1>

                <p className="mt-2 text-slate-500">
                    Invitations, activation et suspension des accès KLIKAO.
                </p>
            </div>

            <div className="mt-8">
                <TeachersManager
                    teachers={teachers}
                />
            </div>
        </main>
    );
}

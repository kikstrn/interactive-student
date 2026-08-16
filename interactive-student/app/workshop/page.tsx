import Link from "next/link";
import KlikaoPageHeader from "@/components/brand/klikao-page-header";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkshopBrowser from "./workshop-browser";

export default async function WorkshopPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: exercises } = await supabase
        .from("workshop_exercises")
        .select(`
            id,
            author_id,
            author_name,
            category_name,
            category_icon,
            input_type,
            title,
            question,
            level,
            exercise_type,
            choices,
            download_count,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    return (
        <main className="min-h-screen bg-slate-50">

            <KlikaoPageHeader
                backHref="/categories"
                backLabel="Mes catégories"
                title="Workshop"
                subtitle="Bibliothèque communautaire KLIKAO"
            />

            <div className="mx-auto max-w-7xl px-6 py-10">
                <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-sm sm:p-10">
                    <div className="max-w-3xl">
                        <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                            Bibliothèque communautaire
                        </span>
                        <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                            Trouvez rapidement de nouveaux exercices
                        </h2>
                        <p className="mt-3 text-lg leading-8 text-indigo-100">
                            Recherchez, filtrez par catégorie, niveau ou type,
                            puis ajoutez un exercice directement à votre bibliothèque.
                        </p>
                    </div>
                </section>

                <WorkshopBrowser
                    exercises={(exercises ?? []) as never[]}
                    currentUserId={user.id}
                />
            </div>
        </main>
    );
}

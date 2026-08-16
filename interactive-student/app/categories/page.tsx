import Link from "next/link";
import KlikaoPageHeader from "@/components/brand/klikao-page-header";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CategoryForm from "./category-form";

export default async function CategoriesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: categories } = await supabase
        .from("subjects")
        .select(`
            id,
            name,
            description,
            icon,
            input_type,
            exercises(count)
        `)
        .eq("teacher_id", user.id)
        .order("name", {
            ascending: true,
        });

    return (
        <main className="min-h-screen bg-slate-50">

            <KlikaoPageHeader
                backHref="/dashboard"
                backLabel="Dashboard"
                title="Exercices"
                subtitle="Organisez vos exercices par catégories"
            />

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">
                            Mes catégories
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Créez vos catégories puis ajoutez les exercices à
                            l&apos;intérieur.
                        </p>
                    </div>

                    <div className="w-full lg:max-w-md">
                        <CategoryForm />
                    </div>
                </div>

                {!categories || categories.length === 0 ? (
                    <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                        <div className="text-6xl">📚</div>

                        <h2 className="mt-5 text-xl font-bold text-slate-800">
                            Aucune catégorie
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Créez par exemple Mathématiques ou Français.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => {
                            const exerciseCount =
                                category.exercises?.[0]?.count ?? 0;

                            return (
                                <Link
                                    key={category.id}
                                    href={`/categories/${category.id}`}
                                    className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
                                            {category.icon ?? "📚"}
                                        </div>

                                        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                                            {exerciseCount} exercice
                                            {exerciseCount > 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <h2 className="mt-5 text-2xl font-black text-slate-900">
                                        {category.name}
                                    </h2>

                                    {category.description && (
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                            {category.description}
                                        </p>
                                    )}

                                    <div className="mt-5 flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-500">
                                            {category.input_type === "numeric"
                                                ? "🔢 Numérique"
                                                : "⌨️ Texte"}
                                        </span>

                                        <span className="font-bold text-indigo-600 transition group-hover:translate-x-1">
                                            Ouvrir →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

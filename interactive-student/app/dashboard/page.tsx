import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "./actions";
import CreateClassForm from "./create-class-form";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

    const { data: classes } = await supabase
        .from("classes")
        .select(`
            id,
            name,
            grade,
            school_year,
            students(count)
        `)
        .order("created_at", { ascending: false });

    const totalStudents =
        classes?.reduce((total, classItem) => {
            const count = classItem.students?.[0]?.count ?? 0;
            return total + count;
        }, 0) ?? 0;

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Interactive Student 🎓
                        </h1>

                        <p className="text-sm text-slate-500">
                            Espace enseignant
                        </p>
                    </div>

                    <Link
                        href="/settings"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Paramètres
                    </Link>

                    <form action={logout}>
                        <button
                            type="submit"
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Déconnexion
                        </button>
                    </form>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Bonjour {profile?.first_name ?? "Professeur"} 👋
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Gérez vos classes et vos élèves.
                        </p>
                    </div>

                    <CreateClassForm />
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Classes
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {classes?.length ?? 0}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Élèves
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {totalStudents}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Exercices
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            0
                        </p>
                    </div>
                </div>

                <section className="mt-12">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Mes classes
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Sélectionnez une classe pour gérer ses élèves.
                        </p>
                    </div>

                    {!classes || classes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <p className="font-medium text-slate-700">
                                Vous n&apos;avez encore aucune classe.
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Créez votre première classe pour commencer.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {classes.map((classItem) => {
                                const studentCount =
                                    classItem.students?.[0]?.count ?? 0;

                                return (
                                    <Link
                                        key={classItem.id}
                                        href={`/classes/${classItem.id}`}
                                        className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900">
                                                    {classItem.name}
                                                </h4>

                                                {classItem.grade && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {classItem.grade}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                {studentCount} élève
                                                {studentCount > 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        {classItem.school_year && (
                                            <p className="mt-6 text-sm text-slate-500">
                                                Année scolaire :{" "}
                                                {classItem.school_year}
                                            </p>
                                        )}

                                        <div className="mt-6 font-semibold text-slate-900">
                                            Ouvrir la classe →
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
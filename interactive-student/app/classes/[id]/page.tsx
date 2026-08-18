import Link from "next/link";
import KlikaoPageHeader from "@/components/brand/klikao-page-header";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "./student-form";
import StudentCard from "./student-card";

type ClassPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ClassPage({
    params,
}: ClassPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: securityProfile } = await supabase
        .from("profiles")
        .select("pin_configured")
        .eq("id", user.id)
        .single();

    const hasTeacherPin =
        securityProfile?.pin_configured === true;

    const { data: classItem } = await supabase
        .from("classes")
        .select(`
            id,
            name,
            grade,
            school_year
        `)
        .eq("id", id)
        .single();

    if (!classItem) {
        notFound();
    }

    const { data: students } = await supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            level,
            avatar
        `)
        .eq("class_id", id)
        .order("first_name", {
            ascending: true,
        });

    return (
        <main className="min-h-screen bg-slate-50">

            <KlikaoPageHeader
                backHref="/dashboard"
                backLabel="Dashboard"
                title={classItem.name}
                subtitle={[classItem.grade, classItem.school_year]
                    .filter(Boolean)
                    .join(" · ")}
            >
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link
                        href={`/classes/${id}/analytics`}
                        className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-sm font-black text-teal-700 transition hover:bg-teal-100"
                    >
                        📊 Statistiques
                    </Link>

                    {hasTeacherPin ? (
                        <Link
                            href={`/classes/${id}/play`}
                            className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
                        >
                            ▶ Mode Classe
                        </Link>
                    ) : (
                        <Link
                            href="/settings?setupPin=required"
                            className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-800 transition hover:bg-amber-100"
                        >
                            🔐 Configurer le PIN
                        </Link>
                    )}
                </div>
            </KlikaoPageHeader>

            {!hasTeacherPin && (
                <div className="border-b border-amber-200 bg-amber-50">
                    <div className="mx-auto max-w-7xl px-6 py-4">
                        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-black text-amber-900">
                                    🔐 Code PIN requis pour le Mode Classe
                                </p>
                                <p className="mt-1 text-sm leading-6 text-amber-700">
                                    Définissez d&apos;abord votre PIN à 4 chiffres. Sans ce code, vous ne pourriez pas quitter le Mode Classe en toute sécurité.
                                </p>
                            </div>

                            <Link
                                href="/settings?setupPin=required"
                                className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-amber-500"
                            >
                                Configurer maintenant
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Élèves
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {students?.length ?? 0} élève
                            {(students?.length ?? 0) > 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-start">

                        <div className="w-full sm:min-w-64 lg:w-auto lg:min-w-72">
                            <StudentForm classId={id} />
                        </div>
                    </div>
                </div>

                <section className="mt-10">
                    {!students || students.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <div className="text-5xl">
                                👩‍🎓
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-800">
                                Aucun élève
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Ajoutez votre premier élève à cette classe.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {students.map((student) => (
                                <StudentCard
                                    key={student.id}
                                    student={student}
                                    classId={id}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
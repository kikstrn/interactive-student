import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentForm from "./student-form";
import {
    deleteStudent,
    updateStudentLevel,
} from "./actions";

type ClassPageProps = {
    params: Promise<{
        id: string;
    }>;
};

const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
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
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-slate-500 hover:text-slate-900"
                        >
                            ← Dashboard
                        </Link>

                        <h1 className="mt-2 text-2xl font-bold text-slate-900">
                            {classItem.name}
                        </h1>

                        <div className="mt-1 flex gap-3 text-sm text-slate-500">
                            {classItem.grade && (
                                <span>
                                    {classItem.grade}
                                </span>
                            )}

                            {classItem.school_year && (
                                <span>
                                    {classItem.school_year}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

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

                    <div className="w-full lg:max-w-md">
                        <StudentForm classId={id} />
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
                                <article
                                    key={student.id}
                                    className="rounded-2xl bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-3xl">
                                            {student.avatar ?? "🙂"}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate font-bold text-slate-900">
                                                {student.first_name}{" "}
                                                {student.last_name}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {
                                                    levelLabels[
                                                        student.level
                                                    ]
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <form
                                            action={async (
                                                formData
                                            ) => {
                                                "use server";

                                                const level = String(
                                                    formData.get(
                                                        "level"
                                                    )
                                                );

                                                await updateStudentLevel(
                                                    student.id,
                                                    id,
                                                    level
                                                );
                                            }}
                                        >
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Niveau
                                            </label>

                                            <select
                                                name="level"
                                                defaultValue={
                                                    student.level
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                            >
                                                <option value="beginner">
                                                    Débutant
                                                </option>

                                                <option value="intermediate">
                                                    Intermédiaire
                                                </option>

                                                <option value="advanced">
                                                    Avancé
                                                </option>
                                            </select>

                                            <button
                                                type="submit"
                                                className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                                            >
                                                Enregistrer le niveau
                                            </button>
                                        </form>
                                    </div>

                                    <form
                                        action={async () => {
                                            "use server";

                                            await deleteStudent(
                                                student.id,
                                                id
                                            );
                                        }}
                                        className="mt-4"
                                    >
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Supprimer
                                        </button>
                                    </form>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
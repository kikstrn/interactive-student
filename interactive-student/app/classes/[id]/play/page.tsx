import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExitClassMode from "./exit-class-mode";

type PlayPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PlayPage({
    params,
}: PlayPageProps) {
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
        .select("id, name")
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
            avatar,
            level
        `)
        .eq("class_id", id)
        .eq("active", true)
        .order("first_name", {
            ascending: true,
        });

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 p-2">
                        <Image
                            src="/branding/klikao-mark.png"
                            alt="KLIKAO"
                            width={48}
                            height={48}
                            priority
                            className="h-full w-full object-contain"
                        />
                    </div>

                    <div>
                    <p className="text-sm font-medium text-slate-400">
                        Mode Classe
                    </p>

                    <h1 className="text-2xl font-black sm:text-3xl">
                            {classItem.name}
                        </h1>
                    </div>
                </div>

                <ExitClassMode classId={id} />
            </header>

            <section className="px-8 pb-12">
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-bold">
                        Qui joue ?
                    </h2>

                    <p className="mt-2 text-lg text-slate-400">
                        Appuie sur ton avatar
                    </p>
                </div>

                {!students || students.length === 0 ? (
                    <div className="mx-auto max-w-xl rounded-3xl bg-white/10 p-10 text-center">
                        Aucun élève dans cette classe.
                    </div>
                ) : (
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {students.map((student) => (
                            <Link
                                key={student.id}
                                href={`/classes/${id}/play/${student.id}`}
                                className="group flex min-h-48 flex-col items-center justify-center rounded-3xl bg-white/10 p-6 text-center transition hover:scale-105 hover:bg-indigo-500/25 active:scale-95"
                            >
                                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl shadow-xl transition group-hover:scale-110">
                                    {student.avatar ?? "🙂"}
                                </div>

                                <div className="mt-5 text-2xl font-bold">
                                    {student.first_name}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
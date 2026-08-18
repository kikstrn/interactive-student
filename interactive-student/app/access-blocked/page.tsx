import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KlikaoLogo from "@/components/brand/klikao-logo";
import { signOutBlockedUser } from "./actions";

type AccessBlockedPageProps = {
    searchParams: Promise<{
        status?: string;
    }>;
};

export default async function AccessBlockedPage({
    searchParams,
}: AccessBlockedPageProps) {
    const params = await searchParams;

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
            access_status,
            is_admin
        `)
        .eq("id", user.id)
        .single();

    if (profile?.is_admin === true) {
        redirect("/admin");
    }

    const status =
        profile?.access_status ??
        params.status ??
        "suspended";

    if (
        status !== "suspended" &&
        status !== "cancelled"
    ) {
        redirect("/dashboard");
    }

    const cancelled =
        status === "cancelled";

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
            <div className="w-full max-w-xl rounded-[2rem] bg-white p-7 text-center shadow-2xl sm:p-10">
                <div className="flex justify-center">
                    <KlikaoLogo
                        href="/"
                        priority
                        className="h-16 sm:h-20"
                    />
                </div>

                <div className="mt-8 text-6xl">
                    {cancelled
                        ? "🔒"
                        : "⏸️"}
                </div>

                <h1 className="mt-5 text-3xl font-black text-slate-900">
                    {cancelled
                        ? "Votre accès KLIKAO est fermé"
                        : "Votre accès KLIKAO est suspendu"}
                </h1>

                <p className="mx-auto mt-4 max-w-md leading-7 text-slate-500">
                    {cancelled
                        ? "Ce compte ne dispose plus d'un accès actif à KLIKAO."
                        : "L'accès à ce compte a été temporairement suspendu par l'administration KLIKAO."}
                </p>

                <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
                    <p className="font-black text-slate-800">
                        Besoin d&apos;aide ?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Contactez l&apos;administration KLIKAO avec l&apos;adresse email utilisée pour votre compte.
                    </p>
                </div>

                <form
                    action={signOutBlockedUser}
                    className="mt-7"
                >
                    <button
                        type="submit"
                        className="min-h-12 w-full cursor-pointer rounded-2xl bg-indigo-600 px-6 font-black text-white transition hover:bg-indigo-500"
                    >
                        Se déconnecter
                    </button>
                </form>
            </div>
        </main>
    );
}

import { createAdminClient } from "@/lib/supabase/admin";
import TicketsManager from "./tickets-manager";

export default async function AdminTicketsPage() {
    const admin =
        createAdminClient();

    const {
        data,
        error,
    } = await admin
        .from("support_tickets")
        .select(`
            id,
            ticket_number,
            teacher_name,
            teacher_email,
            ticket_type,
            subject,
            description,
            page_url,
            page_path,
            screenshot_path,
            user_agent,
            viewport,
            app_version,
            status,
            priority,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(
            `Impossible de charger les tickets : ${error.message}`
        );
    }

    const tickets =
        await Promise.all(
            (data ?? []).map(
                async (ticket) => {
                    let screenshotUrl:
                        | string
                        | null =
                        null;

                    if (
                        ticket.screenshot_path
                    ) {
                        const {
                            data:
                                signedData,
                        } =
                            await admin.storage
                                .from(
                                    "support-screenshots"
                                )
                                .createSignedUrl(
                                    ticket.screenshot_path,
                                    60 * 60
                                );

                        screenshotUrl =
                            signedData?.signedUrl ??
                            null;
                    }

                    return {
                        ...ticket,
                        screenshot_url:
                            screenshotUrl,
                    };
                }
            )
        );

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-indigo-500">
                    Administration
                </p>

                <h1 className="mt-2 text-3xl font-black text-slate-900">
                    🎫 Tickets support
                </h1>

                <p className="mt-2 text-slate-500">
                    Bugs, idées et améliorations envoyés directement depuis KLIKAO.
                </p>
            </div>

            <div className="mt-8">
                <TicketsManager
                    tickets={
                        tickets as never[]
                    }
                />
            </div>
        </main>
    );
}

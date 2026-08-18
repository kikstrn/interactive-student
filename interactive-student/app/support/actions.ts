"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToAdmins } from "@/lib/push/admin-push";

type CreateTicketInput = {
    type:
        | "bug"
        | "idea"
        | "improvement";
    subject: string;
    description: string;
    pageUrl: string;
    pagePath: string;
    screenshotPath:
        | string
        | null;
    userAgent: string;
    viewport: string;
    appVersion:
        | string
        | null;
};

type CreateTicketResult = {
    success: boolean;
    ticketNumber?: number;
    message?: string;
};

const allowedTypes = [
    "bug",
    "idea",
    "improvement",
] as const;

function escapeHtml(
    value: string
) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function notifyAdminsByEmail({
    ticketNumber,
    teacherName,
    teacherEmail,
    type,
    subject,
    description,
    pagePath,
}: {
    ticketNumber: number;
    teacherName: string;
    teacherEmail: string;
    type: string;
    subject: string;
    description: string;
    pagePath: string;
}) {
    const apiKey =
        process.env.BREVO_API_KEY;

    if (!apiKey) {
        return;
    }

    const admin =
        createAdminClient();

    const {
        data: admins,
        error,
    } = await admin
        .from("profiles")
        .select("email")
        .eq("is_admin", true)
        .not("email", "is", null);

    if (error) {
        console.error(
            "Support admin recipients:",
            error
        );
        return;
    }

    const recipients = (
        admins ?? []
    )
        .map((profile) =>
            profile.email?.trim()
        )
        .filter(
            (
                email
            ): email is string =>
                Boolean(email)
        );

    if (
        recipients.length === 0
    ) {
        return;
    }

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        "https://klikao.kstudio.workers.dev";

    const typeLabel =
        type === "bug"
            ? "🐞 Bug"
            : type === "idea"
              ? "💡 Idée"
              : "✨ Amélioration";

    const htmlContent = `
<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<div style="max-width:620px;margin:0 auto;padding:30px 16px;">
<div style="background:#ffffff;border-radius:24px;padding:30px;border:1px solid #e2e8f0;">
<div style="font-size:27px;font-weight:800;color:#4f46e5;">KLIKAO</div>
<div style="margin-top:4px;color:#64748b;font-size:14px;">Nouveau ticket support</div>

<h1 style="font-size:22px;margin:26px 0 8px;">
${typeLabel} #${ticketNumber} — ${escapeHtml(subject)}
</h1>

<p style="margin:0;color:#475569;line-height:1.6;">
Signalé par <strong>${escapeHtml(teacherName || teacherEmail)}</strong>
</p>

<div style="margin-top:22px;background:#f8fafc;border-radius:16px;padding:18px;">
<div style="white-space:pre-wrap;font-size:15px;line-height:1.65;color:#334155;">${escapeHtml(description)}</div>
</div>

<table style="width:100%;margin-top:20px;border-collapse:collapse;font-size:14px;">
<tr>
<td style="padding:7px 0;color:#64748b;">Email</td>
<td style="padding:7px 0;font-weight:700;">${escapeHtml(teacherEmail)}</td>
</tr>
<tr>
<td style="padding:7px 0;color:#64748b;">Page</td>
<td style="padding:7px 0;font-weight:700;">${escapeHtml(pagePath)}</td>
</tr>
</table>

<div style="margin-top:26px;text-align:center;">
<a href="${appUrl}/admin/tickets"
style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:14px;">
Ouvrir les tickets
</a>
</div>
</div>
</div>
</body>
</html>`.trim();

    try {
        const response =
            await fetch(
                "https://api.brevo.com/v3/smtp/email",
                {
                    method: "POST",
                    headers: {
                        accept:
                            "application/json",
                        "content-type":
                            "application/json",
                        "api-key":
                            apiKey,
                    },
                    body: JSON.stringify({
                        sender: {
                            name: "KLIKAO Support",
                            email:
                                process.env
                                    .BREVO_SENDER_EMAIL ??
                                "klikao@outlook.fr",
                        },
                        to:
                            recipients.map(
                                (
                                    email
                                ) => ({
                                    email,
                                })
                            ),
                        subject:
                            `KLIKAO — ${typeLabel} #${ticketNumber} : ${subject}`,
                        htmlContent,
                        tags: [
                            "klikao-support-ticket",
                        ],
                    }),
                    cache: "no-store",
                }
            );

        if (!response.ok) {
            console.error(
                "Brevo support notification:",
                response.status,
                await response.text()
            );
        }
    } catch (error) {
        console.error(
            "Brevo support notification error:",
            error
        );
    }
}

export async function createSupportTicket(
    input: CreateTicketInput
): Promise<CreateTicketResult> {
    const supabase =
        await createClient();

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            message:
                "Votre session a expiré.",
        };
    }

    if (
        !allowedTypes.includes(
            input.type
        )
    ) {
        return {
            success: false,
            message:
                "Type de ticket invalide.",
        };
    }

    const subject =
        input.subject
            .trim()
            .slice(0, 140);

    const description =
        input.description
            .trim()
            .slice(0, 4000);

    if (
        !subject ||
        !description
    ) {
        return {
            success: false,
            message:
                "Le sujet et la description sont obligatoires.",
        };
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select(`
                first_name,
                last_name,
                email
            `)
            .eq("id", user.id)
            .single();

    const teacherEmail =
        profile?.email ??
        user.email ??
        "";

    const teacherName = [
        profile?.first_name,
        profile?.last_name,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const {
        data: ticket,
        error,
    } =
        await supabase
            .from(
                "support_tickets"
            )
            .insert({
                teacher_id:
                    user.id,
                teacher_email:
                    teacherEmail,
                teacher_name:
                    teacherName ||
                    null,
                ticket_type:
                    input.type,
                subject,
                description,
                page_url:
                    input.pageUrl.slice(
                        0,
                        1000
                    ),
                page_path:
                    input.pagePath.slice(
                        0,
                        500
                    ),
                screenshot_path:
                    input.screenshotPath,
                user_agent:
                    input.userAgent.slice(
                        0,
                        1200
                    ),
                viewport:
                    input.viewport.slice(
                        0,
                        50
                    ),
                app_version:
                    input.appVersion
                        ?.slice(
                            0,
                            100
                        ) ??
                    null,
                status: "new",
                priority: "normal",
            })
            .select(
                "id, ticket_number"
            )
            .single();

    if (
        error ||
        !ticket
    ) {
        console.error(
            "createSupportTicket:",
            error
        );

        return {
            success: false,
            message:
                "Impossible d'enregistrer le ticket.",
        };
    }

    // Les notifications ne bloquent jamais la création du ticket.
    void sendPushToAdmins({
        title:
            `🎫 Nouveau ticket #${ticket.ticket_number}`,
        body:
            `${teacherName || teacherEmail} — ${subject}`,
        url:
            "/admin/tickets",
        ticketNumber:
            ticket.ticket_number,
    });

    void notifyAdminsByEmail({
        ticketNumber:
            ticket.ticket_number,
        teacherName,
        teacherEmail,
        type: input.type,
        subject,
        description,
        pagePath:
            input.pagePath,
    });

    return {
        success: true,
        ticketNumber:
            ticket.ticket_number,
    };
}

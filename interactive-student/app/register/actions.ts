"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export async function requestAccess(
    formData: FormData
) {
    const firstName = String(
        formData.get("firstName") ?? ""
    ).trim();

    const lastName = String(
        formData.get("lastName") ?? ""
    ).trim();

    const email = String(
        formData.get("email") ?? ""
    )
        .trim()
        .toLowerCase();

    const school = String(
        formData.get("school") ?? ""
    ).trim();

    const grade = String(
        formData.get("grade") ?? ""
    ).trim();

    const message = String(
        formData.get("message") ?? ""
    ).trim();

    if (!firstName || !lastName || !email) {
        redirect(
            "/register?error=missing-fields"
        );
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {
        redirect(
            "/register?error=invalid-email"
        );
    }

    const allowedGrades = [
        "",
        "CP",
        "CE1",
        "CE2",
        "CM1",
        "CM2",
    ];

    if (!allowedGrades.includes(grade)) {
        redirect(
            "/register?error=invalid-grade"
        );
    }

    const supabase = await createClient();
const { error: insertError } =
        await supabase
            .from("access_requests")
            .insert({
                first_name: firstName,
                last_name: lastName,
                email,
                school:
                    school || null,
                requested_grade:
                    grade || null,
                message:
                    message || null,
                status: "pending",
            });

    if (insertError) {
        if (
            insertError.code === "23505"
        ) {
            redirect(
                "/register?sent=already"
            );
        }

        console.error(
            "Access request insert:",
            insertError
        );

        redirect(
            "/register?error=save-error"
        );
    }

    /*
     * L'email est uniquement une notification.
     * La demande est déjà enregistrée dans Supabase :
     * même si Brevo échoue, elle restera visible dans /admin/requests.
     */
    const apiKey =
        process.env.BREVO_API_KEY;

    if (apiKey) {
        const senderEmail =
            process.env
                .BREVO_SENDER_EMAIL ??
            "klikao@outlook.fr";

        const recipientEmail =
            process.env
                .KLIKAO_ACCESS_REQUEST_EMAIL ??
            "klikao@outlook.fr";

        const safeFirstName =
            escapeHtml(firstName);
        const safeLastName =
            escapeHtml(lastName);
        const safeEmail =
            escapeHtml(email);
        const safeSchool =
            escapeHtml(
                school ||
                    "Non renseigné"
            );
        const safeGrade =
            escapeHtml(
                grade ||
                    "Non renseigné"
            );
        const safeMessage =
            escapeHtml(
                message ||
                    "Aucun message"
            );

        const htmlContent = `
<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">
<div style="background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;">
<div style="font-size:28px;font-weight:800;color:#4f46e5;margin-bottom:8px;">KLIKAO</div>
<div style="font-size:14px;color:#64748b;margin-bottom:28px;">Nouvelle demande d'accès</div>
<h1 style="font-size:22px;margin:0 0 20px;">${safeFirstName} ${safeLastName}</h1>
<table style="width:100%;border-collapse:collapse;font-size:15px;">
<tr><td style="padding:10px 0;color:#64748b;width:150px;">Email</td><td style="padding:10px 0;font-weight:700;">${safeEmail}</td></tr>
<tr><td style="padding:10px 0;color:#64748b;">Établissement</td><td style="padding:10px 0;font-weight:700;">${safeSchool}</td></tr>
<tr><td style="padding:10px 0;color:#64748b;">Classe</td><td style="padding:10px 0;font-weight:700;">${safeGrade}</td></tr>
</table>
<div style="margin-top:24px;padding:18px;border-radius:16px;background:#f8fafc;">
<div style="font-size:13px;font-weight:700;color:#64748b;margin-bottom:8px;">Message</div>
<div style="font-size:15px;line-height:1.6;white-space:pre-wrap;">${safeMessage}</div>
</div>
<p style="margin-top:24px;font-size:13px;color:#64748b;">
La demande est disponible dans l'administration KLIKAO.
</p>
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
                                name: "KLIKAO",
                                email:
                                    senderEmail,
                            },
                            to: [
                                {
                                    email:
                                        recipientEmail,
                                    name: "KLIKAO",
                                },
                            ],
                            replyTo: {
                                email,
                                name: `${firstName} ${lastName}`,
                            },
                            subject:
                                `Nouvelle demande d'accès KLIKAO — ${firstName} ${lastName}`,
                            htmlContent,
                            tags: [
                                "klikao-access-request",
                            ],
                        }),
                        cache: "no-store",
                    }
                );

            if (!response.ok) {
                console.error(
                    "Brevo access request notification:",
                    response.status,
                    await response.text()
                );
            }
        } catch (error) {
            console.error(
                "Brevo notification error:",
                error
            );
        }
    }

    redirect("/register?sent=true");
}

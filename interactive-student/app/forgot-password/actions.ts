"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requestPasswordReset(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
        redirect("/forgot-password?error=missing-email");
    }

    const headersList = await headers();
    const forwardedHost = headersList.get("x-forwarded-host");
    const host = forwardedHost ?? headersList.get("host");
    const protocol =
        headersList.get("x-forwarded-proto") ??
        (host?.includes("localhost") ? "http" : "https");

    const origin = host
        ? `${protocol}://${host}`
        : process.env.NEXT_PUBLIC_SITE_URL;

    if (!origin) {
        redirect("/forgot-password?error=site-url");
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: `${origin}/auth/callback?next=/update-password`,
        }
    );

    if (error) {
        console.error(error);
    }

    // Même réponse qu'un succès pour ne pas révéler si l'email existe.
    redirect("/forgot-password?sent=true");
}

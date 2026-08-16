"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
    const supabase = await createClient();

    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(
        formData.get("confirmPassword") ?? ""
    );

    if (!firstName || !lastName || !email || !password) {
        redirect("/register?error=missing-fields");
    }

    if (password.length < 8) {
        redirect("/register?error=password-too-short");
    }

    if (password !== confirmPassword) {
        redirect("/register?error=password-mismatch");
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
        },
    });

    if (error) {
        redirect(
            `/register?error=${encodeURIComponent(error.message)}`
        );
    }

    redirect("/login?checkEmail=true");
}

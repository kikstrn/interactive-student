"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveNewPassword(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=recovery-session");
    }

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(
        formData.get("confirmPassword") ?? ""
    );

    if (password.length < 8) {
        redirect("/update-password?error=too-short");
    }

    if (password !== confirmPassword) {
        redirect("/update-password?error=mismatch");
    }

    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        console.error(error);
        redirect("/update-password?error=save-error");
    }

    await supabase.auth.signOut();

    redirect("/login?passwordUpdated=true");
}

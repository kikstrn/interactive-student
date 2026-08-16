"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();

    if (!firstName || !lastName) {
        redirect("/settings?profileError=missing-fields");
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (profileError) {
        console.error(profileError);
        redirect("/settings?profileError=save-error");
    }

    const { error: authError } = await supabase.auth.updateUser({
        data: {
            first_name: firstName,
            last_name: lastName,
        },
    });

    if (authError) {
        console.error(authError);
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    redirect("/settings?profileSaved=true");
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
        redirect("/settings?passwordError=too-short");
    }

    if (password !== confirmPassword) {
        redirect("/settings?passwordError=mismatch");
    }

    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        console.error(error);
        redirect(
            `/settings?passwordError=${encodeURIComponent(error.message)}`
        );
    }

    redirect("/settings?passwordSaved=true");
}

export async function setTeacherPin(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const pin = String(formData.get("pin") ?? "");
    const confirmPin = String(formData.get("confirmPin") ?? "");

    if (!/^\d{4}$/.test(pin)) {
        redirect("/settings?pinError=invalid");
    }

    if (pin !== confirmPin) {
        redirect("/settings?pinError=mismatch");
    }

    const { error } = await supabase.rpc("set_teacher_pin", {
        new_pin: pin,
    });

    if (error) {
        console.error(error);
        redirect("/settings?pinError=save-error");
    }

    redirect("/settings?pinSaved=true");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
        redirect("/settings?error=invalid-pin");
    }

    if (pin !== confirmPin) {
        redirect("/settings?error=pin-mismatch");
    }

    const { error } = await supabase.rpc("set_teacher_pin", {
        new_pin: pin,
    });

    if (error) {
        console.error(error);
        redirect("/settings?error=save-error");
    }

    redirect("/settings?saved=true");
}
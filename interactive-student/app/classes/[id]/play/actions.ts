"use server";

import { createClient } from "@/lib/supabase/server";

export type VerifyPinResult = {
    success: boolean;
    reason?:
        | "invalid_pin"
        | "locked"
        | "pin_not_configured"
        | "unauthenticated"
        | "error";
};

export async function verifyTeacherPin(
    pin: string
): Promise<VerifyPinResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            reason: "unauthenticated",
        };
    }

    if (!/^\d{4}$/.test(pin)) {
        return {
            success: false,
            reason: "invalid_pin",
        };
    }

    const { data, error } = await supabase.rpc(
        "verify_teacher_pin",
        {
            input_pin: pin,
        }
    );

    if (error) {
        console.error(error);

        return {
            success: false,
            reason: "error",
        };
    }

    return {
        success: data?.success === true,
        reason: data?.reason,
    };
}
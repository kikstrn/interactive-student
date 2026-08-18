"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PushSubscriptionInput = {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
    userAgent?: string;
};

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

    if (profile?.is_admin !== true) {
        redirect("/dashboard");
    }

    return user;
}

export async function saveAdminPushSubscription(
    subscription: PushSubscriptionInput
) {
    const user = await requireAdmin();

    if (
        !subscription.endpoint ||
        !subscription.keys?.p256dh ||
        !subscription.keys?.auth
    ) {
        return {
            success: false,
            message:
                "Abonnement push incomplet.",
        };
    }

    const admin = createAdminClient();

    const { error } = await admin
        .from("admin_push_subscriptions")
        .upsert(
            {
                user_id: user.id,
                endpoint:
                    subscription.endpoint,
                p256dh:
                    subscription.keys.p256dh,
                auth:
                    subscription.keys.auth,
                expiration_time:
                    subscription.expirationTime
                        ? new Date(
                              subscription.expirationTime
                          ).toISOString()
                        : null,
                user_agent:
                    subscription.userAgent?.slice(
                        0,
                        1000
                    ) ?? null,
                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict: "endpoint",
            }
        );

    if (error) {
        console.error(
            "saveAdminPushSubscription:",
            error
        );

        return {
            success: false,
            message:
                "Impossible d'enregistrer les notifications.",
        };
    }

    return {
        success: true,
    };
}

export async function deleteAdminPushSubscription(
    endpoint: string
) {
    const user = await requireAdmin();

    const admin = createAdminClient();

    const { error } = await admin
        .from("admin_push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);

    if (error) {
        console.error(
            "deleteAdminPushSubscription:",
            error
        );

        return {
            success: false,
        };
    }

    return {
        success: true,
    };
}

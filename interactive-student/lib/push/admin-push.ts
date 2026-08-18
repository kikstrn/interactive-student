import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminPushPayload = {
    title: string;
    body: string;
    url?: string;
    ticketNumber?: number;
};

function configureWebPush() {
    const publicKey =
        process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey =
        process.env.VAPID_PRIVATE_KEY;
    const subject =
        process.env.VAPID_SUBJECT ??
        "mailto:admin@klikao.fr";

    if (
        !publicKey ||
        !privateKey
    ) {
        return false;
    }

    webpush.setVapidDetails(
        subject,
        publicKey,
        privateKey
    );

    return true;
}

export async function sendPushToAdmins(
    payload: AdminPushPayload
) {
    if (!configureWebPush()) {
        console.warn(
            "Push admin ignoré : clés VAPID manquantes."
        );
        return;
    }

    const admin =
        createAdminClient();

    const {
        data: subscriptions,
        error,
    } = await admin
        .from(
            "admin_push_subscriptions"
        )
        .select(`
            id,
            endpoint,
            p256dh,
            auth
        `);

    if (error) {
        console.error(
            "Admin push subscriptions:",
            error
        );
        return;
    }

    await Promise.allSettled(
        (subscriptions ?? []).map(
            async (subscription) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint:
                                subscription.endpoint,
                            keys: {
                                p256dh:
                                    subscription.p256dh,
                                auth:
                                    subscription.auth,
                            },
                        },
                        JSON.stringify(
                            payload
                        )
                    );
                } catch (
                    error: unknown
                ) {
                    const statusCode =
                        typeof error ===
                            "object" &&
                        error !== null &&
                        "statusCode" in
                            error &&
                        typeof (
                            error as {
                                statusCode?: unknown;
                            }
                        ).statusCode ===
                            "number"
                            ? (
                                  error as {
                                      statusCode: number;
                                  }
                              ).statusCode
                            : null;

                    if (
                        statusCode ===
                            404 ||
                        statusCode ===
                            410
                    ) {
                        await admin
                            .from(
                                "admin_push_subscriptions"
                            )
                            .delete()
                            .eq(
                                "id",
                                subscription.id
                            );

                        return;
                    }

                    console.error(
                        "Admin push send:",
                        error
                    );
                }
            }
        )
    );
}

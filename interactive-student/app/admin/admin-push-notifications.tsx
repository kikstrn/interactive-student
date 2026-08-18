"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    deleteAdminPushSubscription,
    saveAdminPushSubscription,
} from "./push-actions";

type PushState =
    | "loading"
    | "unsupported"
    | "denied"
    | "inactive"
    | "active";

function urlBase64ToUint8Array(
    base64String: string
) {
    const padding = "=".repeat(
        (4 -
            (base64String.length %
                4)) %
            4
    );

    const base64 = (
        base64String + padding
    )
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) =>
            char.charCodeAt(0)
        )
    );
}

async function getRegistration() {
    return navigator.serviceWorker.register(
        "/admin/push-sw.js",
        {
            scope: "/admin/",
        }
    );
}

export default function AdminPushNotifications() {
    const [state, setState] =
        useState<PushState>("loading");

    const [message, setMessage] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        async function check() {
            if (
                !("serviceWorker" in navigator) ||
                !("PushManager" in window) ||
                !("Notification" in window)
            ) {
                if (!cancelled) {
                    setState(
                        "unsupported"
                    );
                }
                return;
            }

            if (
                Notification.permission ===
                "denied"
            ) {
                if (!cancelled) {
                    setState("denied");
                }
                return;
            }

            try {
                const registration =
                    await getRegistration();

                const subscription =
                    await registration.pushManager.getSubscription();

                if (!cancelled) {
                    setState(
                        subscription
                            ? "active"
                            : "inactive"
                    );
                }
            } catch (error) {
                console.error(
                    "Push status:",
                    error
                );

                if (!cancelled) {
                    setState(
                        "unsupported"
                    );
                }
            }
        }

        void check();

        return () => {
            cancelled = true;
        };
    }, []);

    async function enable() {
        setMessage("");

        const vapidPublicKey =
            process.env
                .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
            setMessage(
                "Clé VAPID publique manquante."
            );
            return;
        }

        try {
            const permission =
                await Notification.requestPermission();

            if (
                permission !==
                "granted"
            ) {
                setState(
                    permission ===
                        "denied"
                        ? "denied"
                        : "inactive"
                );
                return;
            }

            const registration =
                await getRegistration();

            let subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription =
                    await registration.pushManager.subscribe(
                        {
                            userVisibleOnly:
                                true,
                            applicationServerKey:
                                urlBase64ToUint8Array(
                                    vapidPublicKey
                                ),
                        }
                    );
            }

            const json =
                subscription.toJSON();

            if (
                !json.endpoint ||
                !json.keys?.p256dh ||
                !json.keys?.auth
            ) {
                throw new Error(
                    "Abonnement push incomplet."
                );
            }

            const result =
                await saveAdminPushSubscription(
                    {
                        endpoint:
                            json.endpoint,
                        expirationTime:
                            json.expirationTime ??
                            null,
                        keys: {
                            p256dh:
                                json.keys.p256dh,
                            auth:
                                json.keys.auth,
                        },
                        userAgent:
                            navigator.userAgent,
                    }
                );

            if (!result.success) {
                throw new Error(
                    result.message
                );
            }

            setState("active");
            setMessage(
                "Notifications activées."
            );
        } catch (error) {
            console.error(
                "Enable push:",
                error
            );

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible d'activer les notifications."
            );
        }
    }

    async function disable() {
        setMessage("");

        try {
            const registration =
                await getRegistration();

            const subscription =
                await registration.pushManager.getSubscription();

            if (subscription) {
                await deleteAdminPushSubscription(
                    subscription.endpoint
                );

                await subscription.unsubscribe();
            }

            setState("inactive");
            setMessage(
                "Notifications désactivées."
            );
        } catch (error) {
            console.error(
                "Disable push:",
                error
            );

            setMessage(
                "Impossible de désactiver les notifications."
            );
        }
    }

    if (
        state === "loading"
    ) {
        return (
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
        );
    }

    if (
        state === "unsupported"
    ) {
        return (
            <div
                title="Notifications push non disponibles sur cet appareil ou ce navigateur."
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg opacity-60"
            >
                🔕
            </div>
        );
    }

    if (state === "denied") {
        return (
            <div
                title="Notifications refusées dans les réglages du navigateur."
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-lg"
            >
                🔕
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={
                    state === "active"
                        ? disable
                        : enable
                }
                title={
                    state === "active"
                        ? "Notifications admin activées"
                        : "Activer les notifications admin"
                }
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-black transition ${
                    state === "active"
                        ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
            >
                <span className="text-lg">
                    {state === "active"
                        ? "🔔"
                        : "🔕"}
                </span>

                <span className="hidden xl:inline">
                    {state === "active"
                        ? "Push actif"
                        : "Activer les push"}
                </span>
            </button>

            {message && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-600 shadow-xl">
                    {message}
                </div>
            )}
        </div>
    );
}

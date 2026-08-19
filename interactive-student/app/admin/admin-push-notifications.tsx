"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    deleteAdminPushSubscription,
    saveAdminPushSubscription,
    testAdminPushNotification,
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

    return Uint8Array.from(
        [...window.atob(base64)].map(
            (char) =>
                char.charCodeAt(0)
        )
    );
}

async function cleanupLegacyAdminWorker() {
    const registrations =
        await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
        if (
            registration.scope.endsWith(
                "/admin/"
            )
        ) {
            const subscription =
                await registration.pushManager.getSubscription();

            if (subscription) {
                await deleteAdminPushSubscription(
                    subscription.endpoint
                );

                await subscription.unsubscribe();
            }

            await registration.unregister();

            console.log(
                "[KLIKAO PUSH CLEANUP] ancien worker /admin supprimé"
            );
        }
    }
}

async function getKlikaoRegistration() {
    // IMPORTANT :
    // Le worker PWA /sw.js est enregistré globalement dans app/layout.tsx.
    // On réutilise CETTE registration au lieu d'en créer une deuxième.
    let registration =
        await navigator.serviceWorker.getRegistration(
            "/"
        );

    const scriptUrl =
        registration?.active
            ?.scriptURL ??
        registration?.waiting
            ?.scriptURL ??
        registration?.installing
            ?.scriptURL ??
        "";

    if (
        !registration ||
        !scriptUrl.endsWith(
            "/sw.js"
        )
    ) {
        registration =
            await navigator.serviceWorker.register(
                "/sw.js",
                {
                    scope: "/",
                }
            );
    }

    await registration.update();

    const ready =
        await navigator.serviceWorker.ready;

    console.log(
        "[KLIKAO PUSH REGISTRATION]",
        ready.active?.scriptURL,
        ready.scope
    );

    return ready;
}

export default function AdminPushNotifications() {
    const [state, setState] =
        useState<PushState>("loading");

    const [message, setMessage] =
        useState("");

    const [testing, setTesting] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            if (
                !(
                    "serviceWorker" in
                    navigator
                ) ||
                !(
                    "PushManager" in
                    window
                ) ||
                !(
                    "Notification" in
                    window
                )
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
                await cleanupLegacyAdminWorker();

                const registration =
                    await getKlikaoRegistration();

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
                    "[KLIKAO PUSH STATUS ERROR]",
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

            await cleanupLegacyAdminWorker();

            const registration =
                await getKlikaoRegistration();

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
                                json.keys
                                    .p256dh,
                            auth:
                                json.keys
                                    .auth,
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
                "Notifications activées sur le service worker KLIKAO. Appuie sur Tester."
            );
        } catch (error) {
            console.error(
                "[KLIKAO PUSH ENABLE ERROR]",
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
                await getKlikaoRegistration();

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
                "[KLIKAO PUSH DISABLE ERROR]",
                error
            );

            setMessage(
                "Impossible de désactiver les notifications."
            );
        }
    }

    async function testPush() {
        setTesting(true);
        setMessage(
            "Envoi du test…"
        );

        try {
            const result =
                await testAdminPushNotification();

            setMessage(
                result.message
            );
        } finally {
            setTesting(false);
        }
    }

    if (state === "loading") {
        return (
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
        );
    }

    if (
        state === "unsupported"
    ) {
        return (
            <div
                title="Push non disponible sur cet appareil."
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200"
            >
                🔕
            </div>
        );
    }

    if (state === "denied") {
        return (
            <div
                title="Notifications refusées dans les réglages."
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50"
            >
                🔕
            </div>
        );
    }

    return (
        <div className="relative flex items-center gap-2">
            <button
                type="button"
                onClick={
                    state === "active"
                        ? disable
                        : enable
                }
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-black ${
                    state === "active"
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
            >
                <span>
                    {state ===
                    "active"
                        ? "🔔"
                        : "🔕"}
                </span>

                <span className="hidden xl:inline">
                    {state ===
                    "active"
                        ? "Push actif"
                        : "Activer les push"}
                </span>
            </button>

            {message && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border bg-white p-3 text-xs font-bold shadow-xl">
                    {message}
                </div>
            )}
        </div>
    );
}

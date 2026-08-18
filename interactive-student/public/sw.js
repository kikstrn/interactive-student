const CACHE_NAME = "klikao-static-v1";

const STATIC_ASSETS = [
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/branding/klikao-mark.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

/*
 * KLIKAO depends heavily on Supabase/authenticated server rendering.
 * Do not cache HTML, API or Supabase requests.
 * Only static same-origin GET assets use cache-first.
 */
self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    const isStaticAsset =
        url.pathname.startsWith("/icons/") ||
        url.pathname.startsWith("/branding/") ||
        url.pathname.startsWith("/_next/static/");

    if (!isStaticAsset) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(request).then((response) => {
                if (!response || response.status !== 200) {
                    return response;
                }

                const copy = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, copy);
                });

                return response;
            });
        })
    );
});


/* =========================================================
 * KLIKAO Web Push
 * IMPORTANT: this lives in the SAME root service worker as
 * the PWA cache. Do not register another worker on scope "/".
 * ========================================================= */

self.addEventListener("push", (event) => {
    let payload = {
        title: "KLIKAO",
        body: "Nouvelle notification",
        url: "/admin",
        tag: "klikao-admin",
    };

    try {
        if (event.data) {
            payload = {
                ...payload,
                ...event.data.json(),
            };
        }
    } catch (error) {
        console.error(
            "[KLIKAO SW PUSH PAYLOAD ERROR]",
            error
        );
    }

    const tag =
        payload.tag ||
        (payload.ticketNumber
            ? `klikao-ticket-${payload.ticketNumber}`
            : "klikao-admin");

    event.waitUntil(
        self.registration.showNotification(
            payload.title,
            {
                body: payload.body,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-96x96.png",
                tag,
                renotify: true,
                data: {
                    url:
                        payload.url ||
                        "/admin",
                },
            }
        )
    );
});

self.addEventListener(
    "notificationclick",
    (event) => {
        event.notification.close();

        const targetUrl =
            event.notification.data?.url ||
            "/admin";

        event.waitUntil(
            self.clients
                .matchAll({
                    type: "window",
                    includeUncontrolled:
                        true,
                })
                .then(
                    async (
                        clientList
                    ) => {
                        for (const client of clientList) {
                            try {
                                if (
                                    "navigate" in
                                    client
                                ) {
                                    await client.navigate(
                                        targetUrl
                                    );
                                }

                                if (
                                    "focus" in
                                    client
                                ) {
                                    return client.focus();
                                }
                            } catch {
                                // Continue and try another client/openWindow.
                            }
                        }

                        if (
                            self.clients
                                .openWindow
                        ) {
                            return self.clients.openWindow(
                                targetUrl
                            );
                        }
                    }
                )
        );
    }
);

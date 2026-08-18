/* KLIKAO — Service Worker Push Admin */

self.addEventListener(
    "push",
    (event) => {
        let payload = {
            title:
                "KLIKAO Admin",
            body:
                "Vous avez une nouvelle notification.",
            url:
                "/admin",
        };

        try {
            if (event.data) {
                payload = {
                    ...payload,
                    ...event.data.json(),
                };
            }
        } catch {
            // Conserve le payload par défaut.
        }

        event.waitUntil(
            self.registration.showNotification(
                payload.title,
                {
                    body:
                        payload.body,
                    icon:
                        "/branding/klikao-mark.png",
                    badge:
                        "/branding/klikao-mark.png",
                    tag:
                        payload.ticketNumber
                            ? `klikao-ticket-${payload.ticketNumber}`
                            : "klikao-admin",
                    renotify:
                        true,
                    data: {
                        url:
                            payload.url ||
                            "/admin",
                    },
                }
            )
        );
    }
);

self.addEventListener(
    "notificationclick",
    (event) => {
        event.notification.close();

        const url =
            event.notification.data
                ?.url ||
            "/admin";

        event.waitUntil(
            clients
                .matchAll({
                    type: "window",
                    includeUncontrolled:
                        true,
                })
                .then(
                    (
                        clientList
                    ) => {
                        for (const client of clientList) {
                            if (
                                "focus" in
                                client
                            ) {
                                client.navigate(
                                    url
                                );

                                return client.focus();
                            }
                        }

                        if (
                            clients.openWindow
                        ) {
                            return clients.openWindow(
                                url
                            );
                        }
                    }
                )
        );
    }
);

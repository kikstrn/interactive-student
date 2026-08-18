"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
    useEffect(() => {
        if (
            process.env.NODE_ENV !==
                "production" ||
            !("serviceWorker" in navigator)
        ) {
            return;
        }

        async function register() {
            try {
                const registration =
                    await navigator.serviceWorker.register(
                        "/sw.js",
                        {
                            scope: "/",
                        }
                    );

                // Force le navigateur à vérifier immédiatement la V4.
                await registration.update();

                console.log(
                    "[KLIKAO SW READY]",
                    registration.scope
                );
            } catch (error) {
                console.error(
                    "Impossible d'enregistrer le service worker KLIKAO :",
                    error
                );
            }
        }

        void register();
    }, []);

    return null;
}

"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
    useEffect(() => {
        if (
            process.env.NODE_ENV !== "production" ||
            !("serviceWorker" in navigator)
        ) {
            return;
        }

        navigator.serviceWorker
            .register("/sw.js", {
                scope: "/",
            })
            .catch((error) => {
                console.error(
                    "Impossible d'enregistrer le service worker KLIKAO :",
                    error
                );
            });
    }, []);

    return null;
}

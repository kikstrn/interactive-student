"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
};

export default function InstallKlikaoButton() {
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            ("standalone" in window.navigator &&
                Boolean(
                    (window.navigator as Navigator & {
                        standalone?: boolean;
                    }).standalone
                ));

        if (isStandalone) {
            setInstalled(true);
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPrompt(
                event as BeforeInstallPromptEvent
            );
        };

        const handleInstalled = () => {
            setInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );
        window.addEventListener(
            "appinstalled",
            handleInstalled
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
            window.removeEventListener(
                "appinstalled",
                handleInstalled
            );
        };
    }, []);

    async function install() {
        if (!installPrompt) {
            return;
        }

        await installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
    }

    if (installed) {
        return (
            <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4 text-sm font-bold text-teal-700">
                ✓ KLIKAO est installé sur cet appareil
            </div>
        );
    }

    if (!installPrompt) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                Pour installer KLIKAO, utilisez le menu du navigateur puis
                « Installer l’application » ou « Ajouter à l’écran d’accueil ».
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={install}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 active:scale-[0.99]"
        >
            📲 Installer KLIKAO
        </button>
    );
}

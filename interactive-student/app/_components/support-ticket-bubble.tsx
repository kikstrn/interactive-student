"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { createSupportTicket } from "@/app/support/actions";

type TicketType =
    | "bug"
    | "idea"
    | "improvement";

const hiddenPrefixes = [
    "/login",
    "/register",
    "/invite",
    "/forgot-password",
    "/update-password",
    "/access-blocked",
    "/onboarding",
    "/admin",
];

function createSupabaseBrowserClient() {
    const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
        process.env
            .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createBrowserClient(
        url,
        key
    );
}

export default function SupportTicketBubble() {
    const pathname = usePathname();

    const [authenticated, setAuthenticated] =
        useState(false);
    const [open, setOpen] =
        useState(false);
    const [type, setType] =
        useState<TicketType>("bug");
    const [subject, setSubject] =
        useState("");
    const [description, setDescription] =
        useState("");
    const [screenshot, setScreenshot] =
        useState<File | null>(null);
    const [preview, setPreview] =
        useState("");
    const [submitting, setSubmitting] =
        useState(false);
    const [message, setMessage] =
        useState("");

    const hidden = useMemo(() => {
        if (
            hiddenPrefixes.some(
                (prefix) =>
                    pathname.startsWith(
                        prefix
                    )
            )
        ) {
            return true;
        }

        // Pas de bulle sur le Mode Classe : elle ne doit pas gêner les élèves.
        return /^\/classes\/[^/]+\/play(?:\/|$)/.test(
            pathname
        );
    }, [pathname]);

    useEffect(() => {
        if (hidden) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAuthenticated(false);
            return;
        }

        let cancelled = false;

        async function checkSession() {
            const supabase =
                createSupabaseBrowserClient();

            if (!supabase) {
                return;
            }

            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            if (!cancelled) {
                setAuthenticated(
                    Boolean(user)
                );
            }
        }

        void checkSession();

        return () => {
            cancelled = true;
        };
    }, [hidden]);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(
                    preview
                );
            }
        };
    }, [preview]);

    if (
        hidden ||
        !authenticated
    ) {
        return null;
    }

    function chooseScreenshot(
        file?: File
    ) {
        setMessage("");

        if (!file) {
            setScreenshot(null);
            setPreview("");
            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            setMessage(
                "Le fichier doit être une image."
            );
            return;
        }

        if (
            file.size >
            6 * 1024 * 1024
        ) {
            setMessage(
                "La capture ne doit pas dépasser 6 Mo."
            );
            return;
        }

        if (preview) {
            URL.revokeObjectURL(
                preview
            );
        }

        setScreenshot(file);
        setPreview(
            URL.createObjectURL(file)
        );
    }

    function reset() {
        setType("bug");
        setSubject("");
        setDescription("");
        setScreenshot(null);

        if (preview) {
            URL.revokeObjectURL(
                preview
            );
        }

        setPreview("");
    }

    async function submit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            !subject.trim() ||
            !description.trim()
        ) {
            setMessage(
                "Renseignez un sujet et une description."
            );
            return;
        }

        setSubmitting(true);
        setMessage("");

        try {
            let screenshotPath = "";

            if (screenshot) {
                const supabase =
                    createSupabaseBrowserClient();

                if (!supabase) {
                    throw new Error(
                        "Configuration Supabase indisponible."
                    );
                }

                const {
                    data: { user },
                } =
                    await supabase.auth.getUser();

                if (!user) {
                    throw new Error(
                        "Votre session a expiré."
                    );
                }

                const extension =
                    screenshot.name
                        .split(".")
                        .pop()
                        ?.toLowerCase() ||
                    "png";

                screenshotPath =
                    `${user.id}/${crypto.randomUUID()}.${extension}`;

                const {
                    error: uploadError,
                } =
                    await supabase.storage
                        .from(
                            "support-screenshots"
                        )
                        .upload(
                            screenshotPath,
                            screenshot,
                            {
                                upsert: false,
                                contentType:
                                    screenshot.type ||
                                    "image/png",
                            }
                        );

                if (uploadError) {
                    throw uploadError;
                }
            }

            const result =
                await createSupportTicket({
                    type,
                    subject:
                        subject.trim(),
                    description:
                        description.trim(),
                    pageUrl:
                        window.location.href,
                    pagePath: pathname,
                    screenshotPath:
                        screenshotPath ||
                        null,
                    userAgent:
                        navigator.userAgent,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    appVersion:
                        process.env
                            .NEXT_PUBLIC_APP_VERSION ??
                        null,
                });

            if (!result.success) {
                throw new Error(
                    result.message ??
                        "Impossible d'envoyer le ticket."
                );
            }

            reset();

            setMessage(
                `✓ Ticket #${result.ticketNumber} envoyé. Merci !`
            );

            window.setTimeout(() => {
                setOpen(false);
                setMessage("");
            }, 1800);
        } catch (error) {
            console.error(
                "Support ticket:",
                error
            );

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible d'envoyer le ticket."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setOpen(true);
                    setMessage("");
                }}
                aria-label="Signaler un bug ou proposer une amélioration"
                title="Signaler un problème"
                className="fixed bottom-5 right-5 z-[190] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-600 text-2xl text-white shadow-xl shadow-indigo-950/20 transition hover:-translate-y-1 hover:bg-indigo-500 hover:shadow-2xl sm:bottom-7 sm:right-7"
            >
                🐞
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.currentTarget ===
                                event.target &&
                            !submitting
                        ) {
                            setOpen(false);
                        }
                    }}
                >
                    <div className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-500">
                                    Support KLIKAO
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-slate-900">
                                    🐞 Signaler un problème
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Votre retour arrivera directement dans le tableau de bord administrateur.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(false)
                                }
                                disabled={
                                    submitting
                                }
                                className="cursor-pointer rounded-xl px-3 py-2 font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="mt-6 space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Type
                                </label>

                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            [
                                                "bug",
                                                "🐞 Bug",
                                            ],
                                            [
                                                "idea",
                                                "💡 Idée",
                                            ],
                                            [
                                                "improvement",
                                                "✨ Amélioration",
                                            ],
                                        ] as const
                                    ).map(
                                        ([
                                            value,
                                            label,
                                        ]) => (
                                            <button
                                                key={
                                                    value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setType(
                                                        value
                                                    )
                                                }
                                                className={`min-h-11 cursor-pointer rounded-xl border px-3 py-2 text-sm font-black transition ${
                                                    type ===
                                                    value
                                                        ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {
                                                    label
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Sujet
                                </label>

                                <input
                                    value={
                                        subject
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSubject(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    maxLength={140}
                                    required
                                    placeholder="Ex : Le bouton Écouter ne répond plus"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                    rows={5}
                                    maxLength={4000}
                                    placeholder="Décrivez ce que vous faisiez, ce qui s'est passé et ce que vous attendiez..."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black text-slate-700">
                                    Capture d&apos;écran
                                    <span className="ml-2 font-semibold text-slate-400">
                                        facultative
                                    </span>
                                </label>

                                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50">
                                    <span className="text-3xl">
                                        📎
                                    </span>

                                    <span className="mt-2 text-sm font-black text-slate-700">
                                        {screenshot
                                            ? "Changer la capture"
                                            : "Ajouter une capture"}
                                    </span>

                                    <span className="mt-1 text-xs text-slate-400">
                                        PNG, JPG ou WEBP · 6 Mo max.
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="sr-only"
                                        onChange={(
                                            event
                                        ) =>
                                            chooseScreenshot(
                                                event
                                                    .target
                                                    .files?.[0]
                                            )
                                        }
                                    />
                                </label>

                                {preview && (
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={
                                                preview
                                            }
                                            alt="Aperçu de la capture"
                                            className="max-h-56 w-full rounded-xl object-contain"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                chooseScreenshot()
                                            }
                                            className="mt-2 w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-50"
                                        >
                                            🗑️ Retirer la capture
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                                KLIKAO joindra automatiquement la page actuelle, le navigateur et la taille de l&apos;écran pour faciliter le diagnostic.
                            </div>

                            {message && (
                                <div
                                    className={`rounded-2xl p-4 text-sm font-black ${
                                        message.startsWith(
                                            "✓"
                                        )
                                            ? "bg-teal-50 text-teal-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="min-h-13 w-full cursor-pointer rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? "Envoi du ticket..."
                                    : "Envoyer le signalement"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

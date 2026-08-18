"use client";

import { useState } from "react";
import {
    approveAccessRequest,
    rejectAccessRequest,
} from "../actions";

type AccessRequest = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    school: string | null;
    requested_grade:
        | string
        | null;
    message: string | null;
    status: string;
    created_at: string;
};

export default function AccessRequestsManager({
    requests,
}: {
    requests: AccessRequest[];
}) {
    const [filter, setFilter] =
        useState("pending");
    const [query, setQuery] =
        useState("");
    const [busyId, setBusyId] =
        useState<string | null>(null);
    const [message, setMessage] =
        useState("");

    const visible = requests.filter(
        (request) => {
            const matchesFilter =
                filter === "all" ||
                request.status === filter;

            const haystack = [
                request.first_name,
                request.last_name,
                request.email,
                request.school,
                request.requested_grade,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                matchesFilter &&
                haystack.includes(
                    query.toLowerCase()
                )
            );
        }
    );

    async function approve(
        requestId: string
    ) {
        if (busyId) return;

        if (
            !window.confirm(
                "Accepter cette demande et envoyer l'invitation KLIKAO ?"
            )
        ) {
            return;
        }

        setBusyId(requestId);
        setMessage("");

        const result =
            await approveAccessRequest(
                requestId
            );

        setBusyId(null);
        setMessage(
            result.message ??
                (result.success
                    ? "Invitation envoyée."
                    : "Une erreur est survenue.")
        );
    }

    async function reject(
        requestId: string
    ) {
        if (busyId) return;

        if (
            !window.confirm(
                "Refuser cette demande d'accès ?"
            )
        ) {
            return;
        }

        setBusyId(requestId);
        setMessage("");

        const result =
            await rejectAccessRequest(
                requestId
            );

        setBusyId(null);
        setMessage(
            result.message ??
                (result.success
                    ? "Demande refusée."
                    : "Une erreur est survenue.")
        );
    }

    return (
        <div>
            {message && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            Demandes reçues
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Acceptez une demande pour envoyer automatiquement l&apos;invitation KLIKAO.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={filter}
                            onChange={(
                                event
                            ) =>
                                setFilter(
                                    event.target
                                        .value
                                )
                            }
                            className="min-h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
                        >
                            <option value="pending">
                                En attente
                            </option>
                            <option value="invited">
                                Invitées
                            </option>
                            <option value="rejected">
                                Refusées
                            </option>
                            <option value="all">
                                Toutes
                            </option>
                        </select>

                        <input
                            value={query}
                            onChange={(
                                event
                            ) =>
                                setQuery(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Rechercher..."
                            className="min-h-11 rounded-xl border border-slate-200 px-4 outline-none transition focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {visible.map(
                        (request) => {
                            const busy =
                                busyId ===
                                request.id;

                            return (
                                <article
                                    key={
                                        request.id
                                    }
                                    className="rounded-3xl border border-slate-200 p-5 sm:p-6"
                                >
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-black text-slate-900">
                                                    {
                                                        request.first_name
                                                    }{" "}
                                                    {
                                                        request.last_name
                                                    }
                                                </h3>

                                                <RequestStatus
                                                    status={
                                                        request.status
                                                    }
                                                />

                                                {request.requested_grade && (
                                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                                                        {
                                                            request.requested_grade
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 font-semibold text-slate-600">
                                                {
                                                    request.email
                                                }
                                            </p>

                                            {request.school && (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    🏫{" "}
                                                    {
                                                        request.school
                                                    }
                                                </p>
                                            )}

                                            {request.message && (
                                                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                                    {
                                                        request.message
                                                    }
                                                </div>
                                            )}

                                            <p className="mt-3 text-xs font-semibold text-slate-400">
                                                Demande reçue le{" "}
                                                {new Intl.DateTimeFormat(
                                                    "fr-FR",
                                                    {
                                                        dateStyle:
                                                            "medium",
                                                        timeStyle:
                                                            "short",
                                                    }
                                                ).format(
                                                    new Date(
                                                        request.created_at
                                                    )
                                                )}
                                            </p>
                                        </div>

                                        {request.status ===
                                            "pending" && (
                                            <div className="flex shrink-0 flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        Boolean(
                                                            busyId
                                                        )
                                                    }
                                                    onClick={() =>
                                                        reject(
                                                            request.id
                                                        )
                                                    }
                                                    className="min-h-11 cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Refuser
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        Boolean(
                                                            busyId
                                                        )
                                                    }
                                                    onClick={() =>
                                                        approve(
                                                            request.id
                                                        )
                                                    }
                                                    className="min-h-11 cursor-pointer rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {busy
                                                        ? "Traitement..."
                                                        : "✓ Accepter et inviter"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        }
                    )}

                    {visible.length ===
                        0 && (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                            <div className="text-5xl">
                                📭
                            </div>

                            <p className="mt-4 font-black text-slate-700">
                                Aucune demande
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function RequestStatus({
    status,
}: {
    status: string;
}) {
    const map: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        pending: {
            label: "En attente",
            className:
                "bg-amber-50 text-amber-700",
        },
        approved: {
            label: "Acceptée",
            className:
                "bg-teal-50 text-teal-700",
        },
        invited: {
            label: "Invitation envoyée",
            className:
                "bg-indigo-50 text-indigo-700",
        },
        rejected: {
            label: "Refusée",
            className:
                "bg-red-50 text-red-700",
        },
    };

    const item =
        map[status] ?? map.pending;

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-black ${item.className}`}
        >
            {item.label}
        </span>
    );
}

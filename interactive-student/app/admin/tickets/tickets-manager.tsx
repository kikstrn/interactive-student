"use client";

import {
    useMemo,
    useState,
} from "react";
import {
    updateTicketPriority,
    updateTicketStatus,
} from "./actions";

type Ticket = {
    id: string;
    ticket_number: number;
    teacher_name:
        | string
        | null;
    teacher_email: string;
    ticket_type: string;
    subject: string;
    description: string;
    page_url:
        | string
        | null;
    page_path:
        | string
        | null;
    screenshot_url:
        | string
        | null;
    user_agent:
        | string
        | null;
    viewport:
        | string
        | null;
    app_version:
        | string
        | null;
    status: string;
    priority: string;
    created_at: string;
};

export default function TicketsManager({
    tickets,
}: {
    tickets: Ticket[];
}) {
    const [statusFilter, setStatusFilter] =
        useState("open");
    const [query, setQuery] =
        useState("");
    const [busyId, setBusyId] =
        useState<string | null>(null);
    const [expandedId, setExpandedId] =
        useState<string | null>(
            null
        );

    const visible =
        useMemo(() => {
            const normalized =
                query
                    .trim()
                    .toLowerCase();

            return tickets.filter(
                (ticket) => {
                    const statusMatch =
                        statusFilter ===
                        "all"
                            ? true
                            : statusFilter ===
                                "open"
                              ? [
                                    "new",
                                    "in_progress",
                                ].includes(
                                    ticket.status
                                )
                              : ticket.status ===
                                statusFilter;

                    const searchMatch =
                        !normalized ||
                        [
                            ticket.subject,
                            ticket.description,
                            ticket.teacher_name,
                            ticket.teacher_email,
                            ticket.page_path,
                            String(
                                ticket.ticket_number
                            ),
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                normalized
                            );

                    return (
                        statusMatch &&
                        searchMatch
                    );
                }
            );
        }, [
            tickets,
            statusFilter,
            query,
        ]);

    async function setStatus(
        ticketId: string,
        status: string
    ) {
        setBusyId(
            ticketId
        );

        await updateTicketStatus(
            ticketId,
            status
        );

        setBusyId(null);
    }

    async function setPriority(
        ticketId: string,
        priority: string
    ) {
        setBusyId(
            ticketId
        );

        await updateTicketPriority(
            ticketId,
            priority
        );

        setBusyId(null);
    }

    return (
        <div>
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            Tickets support
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {tickets.length} ticket
                            {tickets.length >
                            1
                                ? "s"
                                : ""}{" "}
                            au total
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="min-h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
                        >
                            <option value="open">
                                Ouverts
                            </option>
                            <option value="new">
                                Nouveaux
                            </option>
                            <option value="in_progress">
                                En cours
                            </option>
                            <option value="resolved">
                                Résolus
                            </option>
                            <option value="closed">
                                Fermés
                            </option>
                            <option value="all">
                                Tous
                            </option>
                        </select>

                        <input
                            value={
                                query
                            }
                            onChange={(
                                event
                            ) =>
                                setQuery(
                                    event
                                        .target
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
                        (ticket) => {
                            const expanded =
                                expandedId ===
                                ticket.id;

                            const busy =
                                busyId ===
                                ticket.id;

                            return (
                                <article
                                    key={
                                        ticket.id
                                    }
                                    className="overflow-hidden rounded-3xl border border-slate-200"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedId(
                                                expanded
                                                    ? null
                                                    : ticket.id
                                            )
                                        }
                                        className="flex w-full cursor-pointer flex-col gap-4 p-5 text-left transition hover:bg-slate-50 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <TypeBadge
                                                    type={
                                                        ticket.ticket_type
                                                    }
                                                />

                                                <StatusBadge
                                                    status={
                                                        ticket.status
                                                    }
                                                />

                                                <PriorityBadge
                                                    priority={
                                                        ticket.priority
                                                    }
                                                />

                                                <span className="text-xs font-black text-slate-400">
                                                    #
                                                    {
                                                        ticket.ticket_number
                                                    }
                                                </span>
                                            </div>

                                            <h3 className="mt-3 truncate text-lg font-black text-slate-900">
                                                {
                                                    ticket.subject
                                                }
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {ticket.teacher_name ||
                                                    ticket.teacher_email}
                                                {" · "}
                                                {new Intl.DateTimeFormat(
                                                    "fr-FR",
                                                    {
                                                        dateStyle:
                                                            "short",
                                                        timeStyle:
                                                            "short",
                                                    }
                                                ).format(
                                                    new Date(
                                                        ticket.created_at
                                                    )
                                                )}
                                            </p>
                                        </div>

                                        <span className="font-black text-indigo-600">
                                            {expanded
                                                ? "Réduire ↑"
                                                : "Voir le ticket ↓"}
                                        </span>
                                    </button>

                                    {expanded && (
                                        <div className="border-t border-slate-200 bg-slate-50/60 p-5 sm:p-6">
                                            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-wide text-slate-400">
                                                        Description
                                                    </h4>

                                                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                                                        {
                                                            ticket.description
                                                        }
                                                    </p>

                                                    {ticket.screenshot_url && (
                                                        <div className="mt-6">
                                                            <h4 className="text-sm font-black uppercase tracking-wide text-slate-400">
                                                                Capture
                                                            </h4>

                                                            <a
                                                                href={
                                                                    ticket.screenshot_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-3 block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-2"
                                                            >
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={
                                                                        ticket.screenshot_url
                                                                    }
                                                                    alt={`Capture du ticket #${ticket.ticket_number}`}
                                                                    className="max-h-[520px] w-full rounded-xl object-contain"
                                                                />
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                                                        <h4 className="font-black text-slate-900">
                                                            Informations techniques
                                                        </h4>

                                                        <dl className="mt-3 space-y-2 text-sm">
                                                            <Info
                                                                label="Professeur"
                                                                value={
                                                                    ticket.teacher_name ||
                                                                    "—"
                                                                }
                                                            />
                                                            <Info
                                                                label="Email"
                                                                value={
                                                                    ticket.teacher_email
                                                                }
                                                            />
                                                            <Info
                                                                label="Page"
                                                                value={
                                                                    ticket.page_path ||
                                                                    "—"
                                                                }
                                                            />
                                                            <Info
                                                                label="Écran"
                                                                value={
                                                                    ticket.viewport ||
                                                                    "—"
                                                                }
                                                            />
                                                            <Info
                                                                label="Version"
                                                                value={
                                                                    ticket.app_version ||
                                                                    "—"
                                                                }
                                                            />
                                                            <Info
                                                                label="Navigateur"
                                                                value={
                                                                    ticket.user_agent ||
                                                                    "—"
                                                                }
                                                            />
                                                        </dl>

                                                        {ticket.page_url && (
                                                            <a
                                                                href={
                                                                    ticket.page_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-4 inline-flex cursor-pointer text-sm font-black text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                Ouvrir la page signalée ↗
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <aside className="space-y-4">
                                                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                                                        <label className="text-sm font-black text-slate-700">
                                                            Statut
                                                        </label>

                                                        <select
                                                            value={
                                                                ticket.status
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setStatus(
                                                                    ticket.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="mt-2 min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="new">
                                                                Nouveau
                                                            </option>
                                                            <option value="in_progress">
                                                                En cours
                                                            </option>
                                                            <option value="resolved">
                                                                Résolu
                                                            </option>
                                                            <option value="closed">
                                                                Fermé
                                                            </option>
                                                        </select>
                                                    </div>

                                                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                                                        <label className="text-sm font-black text-slate-700">
                                                            Priorité
                                                        </label>

                                                        <select
                                                            value={
                                                                ticket.priority
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setPriority(
                                                                    ticket.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="mt-2 min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="low">
                                                                Basse
                                                            </option>
                                                            <option value="normal">
                                                                Normale
                                                            </option>
                                                            <option value="high">
                                                                Haute
                                                            </option>
                                                            <option value="critical">
                                                                Critique
                                                            </option>
                                                        </select>
                                                    </div>
                                                </aside>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        }
                    )}

                    {visible.length ===
                        0 && (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 py-14 text-center">
                            <div className="text-5xl">
                                🎫
                            </div>

                            <p className="mt-4 font-black text-slate-700">
                                Aucun ticket correspondant
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="grid gap-1 sm:grid-cols-[95px_1fr]">
            <dt className="font-bold text-slate-400">
                {label}
            </dt>
            <dd className="break-words font-semibold text-slate-600">
                {value}
            </dd>
        </div>
    );
}

function TypeBadge({
    type,
}: {
    type: string;
}) {
    const config: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        bug: {
            label: "🐞 Bug",
            className:
                "bg-red-50 text-red-700",
        },
        idea: {
            label: "💡 Idée",
            className:
                "bg-amber-50 text-amber-700",
        },
        improvement: {
            label: "✨ Amélioration",
            className:
                "bg-violet-50 text-violet-700",
        },
    };

    const item =
        config[type] ??
        config.bug;

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${item.className}`}
        >
            {item.label}
        </span>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const config: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        new: {
            label: "Nouveau",
            className:
                "bg-indigo-50 text-indigo-700",
        },
        in_progress: {
            label: "En cours",
            className:
                "bg-sky-50 text-sky-700",
        },
        resolved: {
            label: "Résolu",
            className:
                "bg-teal-50 text-teal-700",
        },
        closed: {
            label: "Fermé",
            className:
                "bg-slate-100 text-slate-600",
        },
    };

    const item =
        config[status] ??
        config.new;

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${item.className}`}
        >
            {item.label}
        </span>
    );
}

function PriorityBadge({
    priority,
}: {
    priority: string;
}) {
    const config: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        low: {
            label: "Basse",
            className:
                "bg-slate-100 text-slate-500",
        },
        normal: {
            label: "Normale",
            className:
                "bg-emerald-50 text-emerald-700",
        },
        high: {
            label: "Haute",
            className:
                "bg-orange-50 text-orange-700",
        },
        critical: {
            label: "Critique",
            className:
                "bg-red-100 text-red-800",
        },
    };

    const item =
        config[priority] ??
        config.normal;

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${item.className}`}
        >
            ⚑ {item.label}
        </span>
    );
}

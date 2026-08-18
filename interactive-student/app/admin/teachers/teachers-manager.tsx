"use client";

import { useState } from "react";
import {
    inviteTeacher,
    resendTeacherInvite,
    updateTeacherAccess,
} from "../actions";

type Teacher = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    access_status: string;
    created_at: string | null;
    last_sign_in_at: string | null;
    primary_grade: string | null;
    onboarding_completed: boolean;
    subscription_status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
};

export default function TeachersManager({
    teachers,
}: {
    teachers: Teacher[];
}) {
    const [query, setQuery] =
        useState("");
    const [email, setEmail] =
        useState("");
    const [message, setMessage] =
        useState("");
    const [loading, setLoading] =
        useState(false);

    const filtered = teachers.filter(
        (teacher) => {
            const haystack = [
                teacher.first_name,
                teacher.last_name,
                teacher.email,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(
                query.toLowerCase()
            );
        }
    );

    async function handleInvite(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        const formData =
            new FormData();
        formData.set("email", email);

        const result =
            await inviteTeacher(
                formData
            );

        setLoading(false);
        setMessage(
            result.message ??
                (result.success
                    ? "Invitation envoyée."
                    : "Une erreur est survenue.")
        );

        if (result.success) {
            setEmail("");
        }
    }

    async function changeStatus(
        userId: string,
        status: string
    ) {
        setMessage("");

        const result =
            await updateTeacherAccess(
                userId,
                status
            );

        if (!result.success) {
            setMessage(
                result.message ??
                    "Impossible de modifier le statut."
            );
        }
    }

    async function resend(
        teacherEmail: string
    ) {
        const result =
            await resendTeacherInvite(
                teacherEmail
            );

        setMessage(
            result.success
                ? "Invitation renvoyée."
                : result.message ??
                      "Impossible de renvoyer l'invitation."
        );
    }

    return (
        <div>
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-black text-slate-900">
                    ✉️ Inviter un professeur
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Le professeur recevra l&apos;email d&apos;invitation KLIKAO et pourra créer son mot de passe.
                </p>

                <form
                    onSubmit={handleInvite}
                    className="mt-5 flex flex-col gap-3 sm:flex-row"
                >
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(
                            event
                        ) =>
                            setEmail(
                                event.target
                                    .value
                            )
                        }
                        placeholder="professeur@ecole.fr"
                        className="min-h-12 flex-1 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="min-h-12 cursor-pointer rounded-2xl bg-indigo-600 px-6 font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Envoi..."
                            : "Envoyer l'invitation"}
                    </button>
                </form>

                {message && (
                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                        {message}
                    </p>
                )}
            </section>

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            Professeurs
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {teachers.length} compte
                            {teachers.length >
                            1
                                ? "s"
                                : ""}
                        </p>
                    </div>

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

                <div className="mt-6 space-y-3">
                    {filtered.map(
                        (teacher) => (
                            <article
                                key={
                                    teacher.id
                                }
                                className="rounded-2xl border border-slate-200 p-5"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-black text-slate-900">
                                                {teacher.first_name ||
                                                teacher.last_name
                                                    ? `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim()
                                                    : "Compte invité"}
                                            </h3>

                                            <StatusBadge
                                                status={
                                                    teacher.access_status
                                                }
                                            />

                                            {teacher.primary_grade && (
                                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                                                    {
                                                        teacher.primary_grade
                                                    }
                                                </span>
                                            )}

                                            <SubscriptionBadge
                                                status={
                                                    teacher.subscription_status
                                                }
                                            />
                                        </div>

                                        <p className="mt-1 truncate text-sm text-slate-500">
                                            {
                                                teacher.email
                                            }
                                        </p>

                                        <p className="mt-2 text-xs font-semibold text-slate-400">
                                            Onboarding :{" "}
                                            {teacher.onboarding_completed
                                                ? "terminé"
                                                : "à faire"}
                                            {teacher.last_sign_in_at
                                                ? ` · Dernière connexion : ${new Intl.DateTimeFormat(
                                                      "fr-FR",
                                                      {
                                                          dateStyle:
                                                              "short",
                                                          timeStyle:
                                                              "short",
                                                      }
                                                  ).format(
                                                      new Date(
                                                          teacher.last_sign_in_at
                                                      )
                                                  )}`
                                                : ""}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {teacher.access_status ===
                                            "invited" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    resend(
                                                        teacher.email
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100"
                                            >
                                                Renvoyer
                                            </button>
                                        )}

                                        {teacher.access_status !==
                                            "active" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeStatus(
                                                        teacher.id,
                                                        "active"
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100"
                                            >
                                                Activer
                                            </button>
                                        )}

                                        {teacher.access_status !==
                                            "suspended" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeStatus(
                                                        teacher.id,
                                                        "suspended"
                                                    )
                                                }
                                                className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                                            >
                                                Suspendre
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    )}

                    {filtered.length ===
                        0 && (
                        <p className="py-10 text-center text-slate-400">
                            Aucun professeur trouvé.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const styles: Record<
        string,
        string
    > = {
        active:
            "bg-emerald-50 text-emerald-700",
        invited:
            "bg-amber-50 text-amber-700",
        suspended:
            "bg-red-50 text-red-700",
        cancelled:
            "bg-slate-100 text-slate-600",
    };

    const labels: Record<
        string,
        string
    > = {
        active: "Actif",
        invited: "Invité",
        suspended: "Suspendu",
        cancelled: "Annulé",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${
                styles[status] ??
                styles.invited
            }`}
        >
            {labels[status] ?? status}
        </span>
    );
}


function SubscriptionBadge({
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
        none: {
            label: "Sans abonnement",
            className:
                "bg-slate-100 text-slate-600",
        },
        trial: {
            label: "Essai",
            className:
                "bg-sky-50 text-sky-700",
        },
        active: {
            label: "Abonné",
            className:
                "bg-teal-50 text-teal-700",
        },
        past_due: {
            label: "Paiement en attente",
            className:
                "bg-amber-50 text-amber-700",
        },
        cancelled: {
            label: "Abonnement annulé",
            className:
                "bg-red-50 text-red-700",
        },
    };

    const item =
        config[status] ??
        config.none;

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${item.className}`}
        >
            💳 {item.label}
        </span>
    );
}

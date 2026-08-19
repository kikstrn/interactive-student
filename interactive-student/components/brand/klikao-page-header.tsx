import type { ReactNode } from "react";
import Link from "next/link";
import KlikaoLogo from "./klikao-logo";

type KlikaoPageHeaderProps = {
    backHref?: string;
    backLabel?: string;
    title?: string;
    subtitle?: string;
    children?: ReactNode;
};

export default function KlikaoPageHeader({
    backHref,
    backLabel = "Retour",
    title,
    subtitle,
    children,
}: KlikaoPageHeaderProps) {
    const hasContext =
        Boolean(
            backHref ||
            title ||
            subtitle
        );

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
                {/* Mobile: logo/actions first row, context second row */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                        <KlikaoLogo
                            href="/dashboard"
                            priority
                            className="h-9 sm:h-11"
                        />

                        {hasContext && (
                            <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                        )}

                        <div className="hidden min-w-0 sm:block">
                            {backHref && (
                                <Link
                                    href={backHref}
                                    className="inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs font-black text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-500"
                                >
                                    <span aria-hidden="true">
                                        ←
                                    </span>
                                    <span>
                                        {backLabel}
                                    </span>
                                </Link>
                            )}

                            {title && (
                                <h1 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                                    {title}
                                </h1>
                            )}

                            {subtitle && (
                                <p className="hidden truncate text-sm text-slate-500 md:block">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {children && (
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            {children}
                        </div>
                    )}
                </div>

                {hasContext && (
                    <div className="mt-3 border-t border-slate-100 pt-3 sm:hidden">
                        <div className="flex min-w-0 items-center gap-3">
                            {backHref && (
                                <Link
                                    href={backHref}
                                    aria-label={`Retour vers ${backLabel}`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg font-black text-slate-700 transition active:scale-95"
                                >
                                    ←
                                </Link>
                            )}

                            <div className="min-w-0">
                                {title && (
                                    <h1 className="truncate text-lg font-black text-slate-900">
                                        {title}
                                    </h1>
                                )}

                                {subtitle && (
                                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

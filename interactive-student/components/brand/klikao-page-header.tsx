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
    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                    <KlikaoLogo
                        href="/dashboard"
                        priority
                        className="h-9 sm:h-11"
                    />

                    {(backHref || title || subtitle) && (
                        <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                    )}

                    <div className="min-w-0">
                        {backHref && (
                            <Link
                                href={backHref}
                                className="text-xs font-bold text-indigo-600 transition hover:text-indigo-500"
                            >
                                ← {backLabel}
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
        </header>
    );
}

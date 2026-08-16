import Image from "next/image";
import Link from "next/link";

type KlikaoLogoProps = {
    href?: string | null;
    priority?: boolean;
    variant?: "header" | "auth";
    className?: string;
};

export default function KlikaoLogo({
    href = "/dashboard",
    priority = false,
    variant = "header",
    className = "",
}: KlikaoLogoProps) {
    const content =
        variant === "auth" ? (
            <div className={`flex flex-col items-center ${className}`}>
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-indigo-50 to-teal-50 p-3 shadow-sm ring-1 ring-indigo-100">
                    <Image
                        src="/branding/klikao-mark.png"
                        alt=""
                        width={64}
                        height={64}
                        priority={priority}
                        className="h-full w-full object-contain"
                    />
                </div>

                <div className="mt-4 text-[2rem] font-black leading-none tracking-[0.08em] text-[#0F172A]">
                    KLIKAO
                </div>

                <p className="mt-2 text-sm font-medium text-slate-500">
                    L&apos;enseignement devient interactif.
                </p>
            </div>
        ) : (
            <div className={`flex items-center gap-2.5 ${className}`}>
                <Image
                    src="/branding/klikao-mark.png"
                    alt=""
                    width={48}
                    height={48}
                    priority={priority}
                    className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
                />

                <span className="hidden text-[1.55rem] font-black leading-none tracking-[0.08em] text-[#0F172A] sm:block">
                    KLIKAO
                </span>
            </div>
        );

    if (!href) {
        return content;
    }

    return (
        <Link
            href={href}
            aria-label="KLIKAO"
            className="inline-flex shrink-0 items-center"
        >
            {content}
        </Link>
    );
}

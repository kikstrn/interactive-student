import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./klikao-theme.css";
import RegisterServiceWorker from "@/components/pwa/register-service-worker";
import SupportTicketBubble from "@/app/_components/support-ticket-bubble";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "KLIKAO",
        template: "%s | KLIKAO",
    },
    description:
        "KLIKAO rend la classe interactive grâce à des exercices adaptés au niveau de chaque élève.",
    applicationName: "KLIKAO",
    icons: {
        icon: [
            { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        ],
        apple: [
            { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "KLIKAO",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: "#6366F1",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fr"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full bg-slate-50 text-slate-900">
                <RegisterServiceWorker />
                {children}
                <SupportTicketBubble />
            </body>
        </html>
    );
}

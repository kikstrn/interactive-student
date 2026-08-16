import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "KLIKAO",
        short_name: "KLIKAO",
        description:
            "KLIKAO rend la classe interactive grâce à des exercices adaptés au niveau de chaque élève.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#F1F5F9",
        theme_color: "#6366F1",
        orientation: "any",
        categories: ["education", "productivity"],
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-maskable-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}

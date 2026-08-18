import type { Metadata } from "next";
import Link from "next/link";
import KlikaoLogo from "@/components/brand/klikao-logo";

export const metadata: Metadata = {
    title: "KLIKAO — La classe devient interactive",
    description:
        "KLIKAO aide les professeurs des écoles à créer des exercices interactifs, animer le Mode Classe et suivre la progression de leurs élèves du CP au CM2.",
};

const features = [
    {
        icon: "🎯",
        title: "Mode Classe",
        description:
            "Faites participer les élèves directement sur le tableau interactif avec des exercices adaptés à leur niveau.",
    },
    {
        icon: "✏️",
        title: "Exercices sur mesure",
        description:
            "Questions, QCM, défis, oral, écoute, voix enregistrée et exercices avec image.",
    },
    {
        icon: "📊",
        title: "Progression des élèves",
        description:
            "Visualisez les réussites, les difficultés et les matières à retravailler pour chaque élève.",
    },
    {
        icon: "🧠",
        title: "Entraînement adaptatif",
        description:
            "KLIKAO peut favoriser automatiquement les exercices liés aux difficultés récemment détectées.",
    },
    {
        icon: "🌐",
        title: "Workshop",
        description:
            "Retrouvez les packs officiels KLIKAO et les exercices partagés par la communauté enseignante.",
    },
    {
        icon: "🔊",
        title: "Écoute & voix",
        description:
            "Utilisez la synthèse vocale ou enregistrez votre propre voix pour créer des activités d'écoute.",
    },
];

const grades = [
    {
        grade: "CP",
        icon: "🌱",
        text: "Premiers calculs, lecture, sons, vocabulaire et écoute.",
    },
    {
        grade: "CE1",
        icon: "✏️",
        text: "Calcul, français, conjugaison, lecture et sciences.",
    },
    {
        grade: "CE2",
        icon: "📘",
        text: "Maths, grammaire, histoire, géographie et compréhension.",
    },
    {
        grade: "CM1",
        icon: "🧠",
        text: "Fractions, conjugaison, sciences, anglais et autonomie.",
    },
    {
        grade: "CM2",
        icon: "🚀",
        text: "Décimaux, proportionnalité, histoire, géographie et préparation au collège.",
    },
];

const faq = [
    {
        question: "KLIKAO est-il réservé au primaire ?",
        answer:
            "Oui. KLIKAO est actuellement pensé pour les professeurs des écoles et les classes du CP au CM2.",
    },
    {
        question: "Dois-je installer un logiciel ?",
        answer:
            "Non. KLIKAO fonctionne directement dans le navigateur et peut aussi être installé comme une application PWA sur un ordinateur ou une tablette compatible.",
    },
    {
        question: "Puis-je créer mes propres exercices ?",
        answer:
            "Oui. Vous pouvez créer vos exercices, choisir leur niveau, les garder privés ou les partager dans le Workshop.",
    },
    {
        question: "Puis-je suivre les résultats de mes élèves ?",
        answer:
            "Oui. Les réponses jouées en Mode Classe alimentent automatiquement les statistiques et la progression de chaque élève.",
    },
    {
        question: "Comment obtenir un accès ?",
        answer:
            "KLIKAO fonctionne actuellement sur invitation. Vous pouvez envoyer une demande d'accès depuis le bouton prévu sur cette page.",
    },
];

export default function HomePage() {
    return (
        <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <KlikaoLogo
                        href="/"
                        priority
                        className="h-10 sm:h-12"
                    />

                    <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 lg:flex">
                        <a
                            href="#fonctionnalites"
                            className="transition hover:text-indigo-600"
                        >
                            Fonctionnalités
                        </a>
                        <a
                            href="#mode-classe"
                            className="transition hover:text-indigo-600"
                        >
                            Mode Classe
                        </a>
                        <a
                            href="#primaire"
                            className="transition hover:text-indigo-600"
                        >
                            Du CP au CM2
                        </a>
                        <a
                            href="#faq"
                            className="transition hover:text-indigo-600"
                        >
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className="hidden min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-black text-slate-600 transition hover:bg-slate-100 sm:flex"
                        >
                            Se connecter
                        </Link>

                        <Link
                            href="/register"
                            className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                        >
                            Demander un accès
                        </Link>
                    </div>
                </div>
            </header>

            <section className="relative">
                <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-200/35 blur-3xl" />

                <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-24">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-black text-indigo-700 shadow-sm">
                            <span>✨</span>
                            Pensé pour les professeurs des écoles
                        </div>

                        <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                            Faites participer
                            <span className="block bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                                toute la classe.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                            KLIKAO transforme votre tableau interactif en un espace pédagogique vivant : créez des exercices, faites jouer les élèves et suivez leur progression du CP au CM2.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 px-7 text-base font-black text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                            >
                                ✉️ Demander un accès
                            </Link>

                            <a
                                href="#mode-classe"
                                className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-base font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
                            >
                                ▶ Découvrir KLIKAO
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-slate-500">
                            <span>✓ CP → CM2</span>
                            <span>✓ Aucune installation obligatoire</span>
                            <span>✓ PWA installable</span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-10 top-12 hidden h-24 w-24 rounded-full bg-teal-300/50 blur-2xl sm:block" />
                        <div className="absolute -right-8 bottom-8 hidden h-32 w-32 rounded-full bg-violet-300/50 blur-2xl sm:block" />

                        <div className="relative rounded-[2rem] border border-white/80 bg-white p-3 shadow-2xl shadow-indigo-950/15 sm:p-4">
                            <div className="rounded-[1.6rem] bg-slate-950 p-4 sm:p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-300">
                                            Mode Classe
                                        </p>
                                        <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                                            Emma · CE1
                                        </h2>
                                    </div>

                                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white">
                                        Mathématiques
                                    </span>
                                </div>

                                <div className="mt-6 rounded-3xl bg-white p-6 text-center sm:p-8">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                                        🧠
                                    </div>

                                    <p className="mt-5 text-sm font-black uppercase tracking-wide text-indigo-500">
                                        Entraînement adapté
                                    </p>

                                    <p className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                                        Combien font 8 × 7 ?
                                    </p>

                                    <div className="mx-auto mt-7 max-w-sm rounded-2xl border-2 border-indigo-100 bg-indigo-50 px-5 py-4 text-3xl font-black text-indigo-700">
                                        56
                                    </div>

                                    <div className="mt-4 rounded-2xl bg-teal-50 px-5 py-3 font-black text-teal-700">
                                        ✓ Bonne réponse !
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
                                    <div className="rounded-2xl bg-white/5 px-3 py-3">
                                        🎯 Niveau adapté
                                    </div>
                                    <div className="rounded-2xl bg-white/5 px-3 py-3">
                                        📊 Résultat enregistré
                                    </div>
                                    <div className="rounded-2xl bg-white/5 px-3 py-3">
                                        🔐 PIN professeur
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-5 -left-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:-left-8">
                            <p className="text-xs font-black text-slate-400">
                                Progression
                            </p>
                            <p className="mt-1 text-lg font-black text-emerald-600">
                                82 % ✓
                            </p>
                        </div>

                        <div className="absolute -right-3 -top-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:-right-8">
                            <p className="text-xs font-black text-slate-400">
                                Workshop
                            </p>
                            <p className="mt-1 text-lg font-black text-indigo-600">
                                ⭐ CP → CM2
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
                    <MiniStat value="CP → CM2" label="pensé pour le primaire" />
                    <MiniStat value="6+" label="formats d'exercices" />
                    <MiniStat value="📊" label="suivi individuel" />
                    <MiniStat value="🌐" label="Workshop enseignant" />
                </div>
            </section>

            <section
                id="fonctionnalites"
                className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
            >
                <SectionHeading
                    eyebrow="Tout au même endroit"
                    title="Un outil simple pour préparer, animer et suivre."
                    description="KLIKAO centralise les fonctions essentielles pour faire participer les élèves sans multiplier les outils."
                />

                <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <article
                            key={feature.title}
                            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 sm:p-7"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl transition group-hover:scale-105">
                                {feature.icon}
                            </div>

                            <h3 className="mt-5 text-xl font-black text-slate-900">
                                {feature.title}
                            </h3>

                            <p className="mt-2 leading-7 text-slate-500">
                                {feature.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section
                id="mode-classe"
                className="bg-slate-950 py-20 text-white lg:py-28"
            >
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-400">
                            Mode Classe
                        </p>

                        <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                            Le tableau devient un vrai terrain de jeu pédagogique.
                        </h2>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            Sélectionnez un élève, lancez un exercice et laissez-le répondre directement devant la classe. KLIKAO enregistre automatiquement le résultat.
                        </p>

                        <div className="mt-8 space-y-4">
                            <DarkFeature
                                icon="👩‍🎓"
                                title="Chaque élève a son profil"
                                text="Avatar, niveau et historique de progression."
                            />
                            <DarkFeature
                                icon="🧠"
                                title="Exercices adaptatifs"
                                text="Les matières en difficulté peuvent être retravaillées plus souvent."
                            />
                            <DarkFeature
                                icon="🔊"
                                title="Activités multimédia"
                                text="Image, écoute, voix enregistrée, QCM et réponses libres."
                            />
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <DemoCard
                                icon="🖼️"
                                title="Observation"
                                body="Qu'est-ce que cela représente ?"
                                detail="Une pomme"
                            />
                            <DemoCard
                                icon="🔊"
                                title="Écoute"
                                body="Écoute la voix du professeur"
                                detail="43"
                            />
                            <DemoCard
                                icon="☑️"
                                title="QCM"
                                body="Quelle est la bonne réponse ?"
                                detail="4 choix"
                            />
                            <DemoCard
                                icon="🗣️"
                                title="Oral"
                                body="Réponds devant la classe"
                                detail="Validation prof"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="primaire"
                className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
            >
                <SectionHeading
                    eyebrow="Pensé pour l'école primaire"
                    title="Un pack de démarrage pour chaque classe."
                    description="Un professeur peut retrouver rapidement des exercices officiels adaptés à son niveau de classe et les personnaliser."
                />

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {grades.map((item) => (
                        <article
                            key={item.grade}
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="text-4xl">{item.icon}</div>
                            <h3 className="mt-4 text-2xl font-black text-slate-900">
                                {item.grade}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {item.text}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-500 p-7 text-white shadow-xl sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.17em] text-indigo-100">
                                🎒 Démarrage rapide
                            </p>
                            <h3 className="mt-3 text-3xl font-black">
                                Une nouvelle classe peut être prête en quelques minutes.
                            </h3>
                            <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
                                Créez votre classe, installez un pack de démarrage, ajoutez vos élèves et lancez votre premier Mode Classe.
                            </p>
                        </div>

                        <Link
                            href="/register"
                            className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl bg-white px-7 font-black text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                        >
                            Demander un accès →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-200 bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Suivi pédagogique"
                        title="Voyez ce qui fonctionne. Repérez ce qui doit être retravaillé."
                        description="Les réponses des élèves alimentent automatiquement leur historique et les statistiques de la classe."
                    />

                    <div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
                        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
                                    🙂 
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">
                                        Emma
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Progression individuelle
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 space-y-5">
                                <ProgressLine label="Mathématiques" value={82} />
                                <ProgressLine label="Français" value={63} />
                                <ProgressLine label="Anglais" value={91} />
                            </div>

                            <div className="mt-7 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-emerald-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                                        💪 Point fort
                                    </p>
                                    <p className="mt-2 font-black text-emerald-900">
                                        Anglais · 91 %
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-amber-600">
                                        🎯 À travailler
                                    </p>
                                    <p className="mt-2 font-black text-amber-900">
                                        Français · 63 %
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                                        CE1 A
                                    </p>
                                    <h3 className="mt-1 text-2xl font-black text-slate-900">
                                        Statistiques de la classe
                                    </h3>
                                </div>

                                <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                                    78 % de réussite
                                </span>
                            </div>

                            <div className="mt-7 grid gap-3 sm:grid-cols-3">
                                <Metric label="Réponses" value="248" />
                                <Metric label="Élèves actifs" value="24" />
                                <Metric label="Matières" value="8" />
                            </div>

                            <div className="mt-6 space-y-3">
                                {[
                                    ["Mathématiques", "84 %", "➗"],
                                    ["Lecture", "79 %", "📖"],
                                    ["Conjugaison", "61 %", "✍️"],
                                ].map(([label, value, icon]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                                    >
                                        <span className="font-black text-slate-700">
                                            {icon} {label}
                                        </span>
                                        <span className="font-black text-indigo-600">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-xl sm:p-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-300">
                            📲 PWA
                        </p>
                        <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                            Un site web qui peut aussi s&apos;installer comme une application.
                        </h2>
                        <p className="mt-4 max-w-xl leading-8 text-slate-300">
                            Ouvrez KLIKAO depuis votre navigateur ou installez-le sur votre appareil compatible pour y accéder comme à une application classique.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ["💻", "Ordinateur"],
                            ["📱", "Tablette"],
                            ["🌐", "Navigateur"],
                            ["⚡", "Accès rapide"],
                        ].map(([icon, label]) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
                            >
                                <div className="text-3xl">{icon}</div>
                                <p className="mt-2 font-black">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="faq"
                className="bg-white py-20 lg:py-28"
            >
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Questions fréquentes"
                        title="Tout ce qu'il faut savoir pour commencer."
                        description=""
                    />

                    <div className="mt-10 space-y-3">
                        {faq.map((item) => (
                            <details
                                key={item.question}
                                className="group rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 open:bg-white open:shadow-sm"
                            >
                                <summary className="cursor-pointer list-none font-black text-slate-900">
                                    <span className="flex items-center justify-between gap-4">
                                        {item.question}
                                        <span className="text-indigo-500 transition group-open:rotate-45">
                                            +
                                        </span>
                                    </span>
                                </summary>
                                <p className="mt-3 leading-7 text-slate-500">
                                    {item.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-center text-white shadow-2xl shadow-indigo-200 sm:p-12">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-100">
                        KLIKAO
                    </p>
                    <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-5xl">
                        Envie de tester KLIKAO dans votre classe ?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-indigo-100">
                        Les accès sont actuellement ouverts sur invitation pour les professeurs des écoles.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl bg-white px-7 font-black text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                        >
                            ✉️ Demander mon accès
                        </Link>

                        <Link
                            href="/login"
                            className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-7 font-black text-white transition hover:bg-white/15"
                        >
                            J&apos;ai déjà un compte
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <KlikaoLogo
                        href="/"
                        className="h-9"
                    />

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
                        <Link href="/login" className="hover:text-indigo-600">
                            Connexion
                        </Link>
                        <Link href="/register" className="hover:text-indigo-600">
                            Demander un accès
                        </Link>
                        <a href="#faq" className="hover:text-indigo-600">
                            FAQ
                        </a>
                    </div>

                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} KLIKAO
                    </p>
                </div>
            </footer>
        </main>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-600">
                {eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {title}
            </h2>

            {description && (
                <p className="mt-5 text-lg leading-8 text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}

function MiniStat({
    value,
    label,
}: {
    value: string;
    label: string;
}) {
    return (
        <div>
            <p className="text-xl font-black text-slate-900 sm:text-2xl">
                {value}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-400">
                {label}
            </p>
        </div>
    );
}

function DarkFeature({
    icon,
    title,
    text,
}: {
    icon: string;
    title: string;
    text: string;
}) {
    return (
        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                {icon}
            </div>
            <div>
                <p className="font-black text-white">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
            </div>
        </div>
    );
}

function DemoCard({
    icon,
    title,
    body,
    detail,
}: {
    icon: string;
    title: string;
    body: string;
    detail: string;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-sm">
            <div className="text-3xl">{icon}</div>
            <p className="mt-4 font-black">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
            <div className="mt-4 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-700">
                {detail}
            </div>
        </div>
    );
}

function ProgressLine({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-slate-700">{label}</span>
                <span className="font-black text-indigo-600">{value} %</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
                {value}
            </p>
        </div>
    );
}

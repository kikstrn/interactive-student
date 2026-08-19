"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    completeTutorial,
    skipTutorial,
    updateTutorialProgress,
} from "./actions";

type ProductTourProps = {
    autoStart: boolean;
    forceStart?: boolean;
    initialStep?: number;
};

const steps = [
    {
        target: "dashboard-home",
        title: "Votre tableau de bord",
        description:
            "Retrouvez ici vos classes, vos élèves et les raccourcis principaux de KLIKAO.",
    },
    {
        target: "create-class",
        title: "Créer une classe",
        description:
            "Ajoutez autant de classes que nécessaire. Vous pourrez ensuite y inscrire vos élèves.",
    },
    {
        target: "exercises",
        title: "Vos exercices",
        description:
            "Créez vos catégories et vos propres exercices : questions, QCM, oral, défis et écoute vocale.",
    },
    {
        target: "workshop",
        title: "Le Workshop",
        description:
            "Téléchargez les packs officiels KLIKAO ou les exercices partagés par d'autres enseignants.",
    },
    {
        target: "class-list",
        title: "Vos classes",
        description:
            "Ouvrez une classe pour gérer les élèves, consulter leur progression et lancer le Mode Classe.",
    },
    {
        target: "settings",
        title: "Vos paramètres",
        description:
            "Modifiez votre profil, votre mot de passe, votre PIN et retrouvez les options d'aide.",
    },
] as const;

type Box = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export default function ProductTour({
    autoStart,
    forceStart = false,
    initialStep = 0,
}: ProductTourProps) {
    const shouldStart =
        forceStart || autoStart;

    const [open, setOpen] =
        useState(shouldStart);

    const [stepIndex, setStepIndex] =
        useState(
            Math.max(
                0,
                Math.min(
                    initialStep,
                    steps.length - 1
                )
            )
        );

    const [box, setBox] =
        useState<Box | null>(null);

    const step = steps[stepIndex];

    useEffect(() => {
        if (!open) {
            return;
        }

        let frameOne = 0;
        let frameTwo = 0;
        let settleTimer = 0;

        function locateTarget() {
            const element =
                document.querySelector<HTMLElement>(
                    `[data-tour="${step.target}"]`
                );

            if (!element) {
                setBox(null);
                return;
            }

            const targetElement =
                element;

            const isMobile =
                window.matchMedia(
                    "(max-width: 767px)"
                ).matches;

            function measure(
                measuredElement:
                    HTMLElement
            ) {
                const rect =
                    measuredElement.getBoundingClientRect();

                const padding = 8;

                setBox({
                    top:
                        rect.top -
                        padding,
                    left:
                        rect.left -
                        padding,
                    width:
                        rect.width +
                        padding * 2,
                    height:
                        rect.height +
                        padding * 2,
                });
            }

            /*
             * DESKTOP / TABLETTE :
             * on conserve volontairement le comportement historique,
             * puisqu'il est correct dans la vidéo desktop.
             */
            if (!isMobile) {
                measure(
                    targetElement
                );

                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

                return;
            }

            /*
             * MOBILE :
             * l'ancien code mesurait AVANT le scroll. Le rectangle pouvait
             * donc garder les coordonnées précédentes le temps que la page
             * se déplace.
             *
             * On scroll d'abord, puis on mesure après deux frames.
             */

            let mobileTarget =
                targetElement;

            /*
             * Étape "Vos classes" :
             * sur desktop il est agréable d'encadrer toute la section.
             * Sur mobile la section est très haute et le rectangle descend
             * quasiment jusqu'en bas de l'écran.
             *
             * On encadre donc la première vraie carte de classe si elle
             * existe, tout en gardant le comportement desktop inchangé.
             */
            if (
                step.target ===
                "class-list"
            ) {
                const firstClassCard =
                    targetElement.querySelector<HTMLElement>(
                        'a[href^="/classes/"]'
                    );

                if (
                    firstClassCard
                ) {
                    mobileTarget =
                        firstClassCard;
                }
            }

            /*
             * Les onglets du header sont déjà visibles : inutile de faire
             * défiler la page pour Exercices / Workshop / Paramètres.
             */
            const headerTarget =
                step.target ===
                    "exercises" ||
                step.target ===
                    "workshop" ||
                step.target ===
                    "settings";

            if (!headerTarget) {
                mobileTarget.scrollIntoView({
                    behavior: "auto",
                    block:
                        step.target ===
                        "create-class"
                            ? "start"
                            : "center",
                    inline: "nearest",
                });

                /*
                 * Pour Nouvelle classe, on laisse un peu d'espace sous le
                 * header afin que la cible ne soit jamais collée tout en haut.
                 */
                if (
                    step.target ===
                    "create-class"
                ) {
                    window.scrollBy({
                        top: -88,
                        behavior: "auto",
                    });
                }
            }

            frameOne =
                window.requestAnimationFrame(
                    () => {
                        frameTwo =
                            window.requestAnimationFrame(
                                () => {
                                    measure(
                                        mobileTarget
                                    );

                                    /*
                                     * Safari / PWA peut ajuster légèrement le
                                     * viewport après le scroll. Une seconde
                                     * mesure stabilise le rectangle sans
                                     * toucher au comportement desktop.
                                     */
                                    settleTimer =
                                        window.setTimeout(
                                            () =>
                                                measure(
                                                    mobileTarget
                                                ),
                                            100
                                        );
                                }
                            );
                    }
                );
        }

        const timer = window.setTimeout(
            locateTarget,
            120
        );

        window.addEventListener(
            "resize",
            locateTarget
        );

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(
                settleTimer
            );
            window.cancelAnimationFrame(
                frameOne
            );
            window.cancelAnimationFrame(
                frameTwo
            );
            window.removeEventListener(
                "resize",
                locateTarget
            );
        };
    }, [open, step]);

    const cardPosition =
        useMemo(() => {
            if (!box) {
                return {
                    left: "50%",
                    top: "50%",
                    transform:
                        "translate(-50%, -50%)",
                };
            }

            const isMobile =
                window.innerWidth < 768;

            const cardWidth = Math.min(
                420,
                window.innerWidth -
                    (isMobile ? 24 : 32)
            );

            let left =
                box.left +
                box.width / 2 -
                cardWidth / 2;

            left = Math.max(
                16,
                Math.min(
                    left,
                    window.innerWidth -
                        cardWidth -
                        16
                )
            );

            const below =
                box.top +
                box.height +
                (isMobile ? 14 : 18);

            /*
             * Mobile : estimation un peu plus réaliste de la hauteur de la
             * popup. Cela évite qu'elle recouvre la cible, notamment sur
             * "Vos classes".
             *
             * Desktop : valeurs historiques conservées.
             */
            const estimatedCardHeight =
                isMobile
                    ? 300
                    : 260;

            const top =
                below +
                    estimatedCardHeight <
                window.innerHeight -
                    8
                    ? below
                    : Math.max(
                          isMobile
                              ? 10
                              : 16,
                          box.top -
                              (isMobile
                                  ? 318
                                  : 280)
                      );

            return {
                left,
                top,
                transform: "none",
                width: cardWidth,
            };
        }, [box]);

    if (!open) {
        return null;
    }

    async function next() {
        const nextIndex =
            stepIndex + 1;

        if (nextIndex >= steps.length) {
            await completeTutorial();
            setOpen(false);
            return;
        }

        setStepIndex(nextIndex);

        void updateTutorialProgress(
            nextIndex
        );
    }

    function previous() {
        const nextIndex = Math.max(
            0,
            stepIndex - 1
        );

        setStepIndex(nextIndex);

        void updateTutorialProgress(
            nextIndex
        );
    }

    async function quit() {
        await skipTutorial();
        setOpen(false);
    }

    return (
        <div className="fixed inset-0 z-[250]">
            <div className="absolute inset-0 bg-slate-950/65" />

            {box && (
                <div
                    className="pointer-events-none fixed z-[251] rounded-3xl ring-4 ring-indigo-400 ring-offset-4 ring-offset-white shadow-[0_0_0_9999px_rgba(15,23,42,0.10)]"
                    style={{
                        top: box.top,
                        left: box.left,
                        width: box.width,
                        height: box.height,
                    }}
                />
            )}

            <div
                className="fixed z-[252] rounded-[2rem] bg-white p-6 shadow-2xl sm:p-7"
                style={cardPosition}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                            Étape {stepIndex + 1} /{" "}
                            {steps.length}
                        </span>

                        <h2 className="mt-4 text-2xl font-black text-slate-900">
                            {step.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={quit}
                        className="cursor-pointer rounded-xl px-3 py-2 text-sm font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        Quitter
                    </button>
                </div>

                <p className="mt-3 leading-7 text-slate-600">
                    {step.description}
                </p>

                <div className="mt-6 flex items-center gap-2">
                    {steps.map(
                        (_, index) => (
                            <span
                                key={index}
                                className={`h-2 rounded-full transition-all ${
                                    index ===
                                    stepIndex
                                        ? "w-8 bg-indigo-600"
                                        : index <
                                            stepIndex
                                          ? "w-2 bg-teal-400"
                                          : "w-2 bg-slate-200"
                                }`}
                            />
                        )
                    )}
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        onClick={previous}
                        disabled={
                            stepIndex === 0
                        }
                        className="min-h-11 cursor-pointer rounded-xl border border-slate-200 px-5 font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        ← Précédent
                    </button>

                    <button
                        type="button"
                        onClick={next}
                        className="min-h-11 cursor-pointer rounded-xl bg-indigo-600 px-6 font-black text-white transition hover:bg-indigo-500"
                    >
                        {stepIndex ===
                        steps.length - 1
                            ? "Terminer 🎉"
                            : "Suivant →"}
                    </button>
                </div>
            </div>
        </div>
    );
}

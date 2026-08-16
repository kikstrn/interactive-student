"use client";

import { useMemo, useState } from "react";

type AvatarPickerProps = {
    name?: string;
    defaultValue?: string | null;
};

const avatarGroups = {
    Visages: [
        "🙂", "😊", "😄", "😁", "🤓", "😎", "🥳", "🤩",
        "😇", "🧐", "🤠", "😺", "😸", "😻", "🤗", "🥰",
    ],
    Animaux: [
        "🐶", "🐱", "🐰", "🐼", "🐨", "🦊", "🐻", "🐯",
        "🦁", "🐸", "🐵", "🐧", "🐥", "🦄", "🐙", "🦋",
        "🐢", "🐬", "🦖", "🦕", "🐝", "🐞", "🦔", "🐿️",
    ],
    Nature: [
        "🌸", "🌻", "🌈", "⭐", "🌙", "☀️", "🍀", "🍄",
        "🌊", "🔥", "❄️", "🌵", "🌴", "🍓", "🍉", "🍒",
    ],
    Fantaisie: [
        "🧙", "🧚", "🧜", "🦸", "🥷", "👻", "🤖", "👽",
        "🧞", "🧛", "🧝", "🦹", "🪄", "🔮", "👑", "💫",
    ],
    Fun: [
        "🚀", "🎨", "🎸", "⚽", "🎾", "🏀", "🎮", "🧩",
        "🎲", "🎯", "🎤", "🎧", "🛹", "🚲", "🏆", "🎈",
    ],
} as const;

type AvatarGroupName = keyof typeof avatarGroups;

export default function AvatarPicker({
    name = "avatar",
    defaultValue,
}: AvatarPickerProps) {
    const initialAvatar =
        defaultValue && defaultValue.trim()
            ? defaultValue
            : "🙂";

    const [selectedAvatar, setSelectedAvatar] =
        useState(initialAvatar);

    const initialGroup = useMemo<AvatarGroupName>(() => {
        const result = Object.entries(avatarGroups).find(
            ([, avatars]) =>
                avatars.includes(initialAvatar as never)
        );

        return (result?.[0] as AvatarGroupName | undefined) ?? "Visages";
    }, [initialAvatar]);

    const [activeGroup, setActiveGroup] =
        useState<AvatarGroupName>(initialGroup);

    const groupIcons: Record<AvatarGroupName, string> = {
        Visages: "😊",
        Animaux: "🐼",
        Nature: "🌈",
        Fantaisie: "🦄",
        Fun: "🚀",
    };

    return (
        <div>
            <input
                type="hidden"
                name={name}
                value={selectedAvatar}
            />

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900 sm:text-lg">
                            Choisir un avatar
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            L&apos;avatar sera visible en Mode Classe.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Sélection
                        </span>

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm ring-2 ring-indigo-100">
                            {selectedAvatar}
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {(Object.keys(avatarGroups) as AvatarGroupName[]).map(
                        (group) => {
                            const active = group === activeGroup;

                            return (
                                <button
                                    key={group}
                                    type="button"
                                    onClick={() => setActiveGroup(group)}
                                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                                        active
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                    }`}
                                >
                                    <span>{groupIcons[group]}</span>
                                    {group}
                                </button>
                            );
                        }
                    )}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                    {avatarGroups[activeGroup].map((avatar) => {
                        const selected = avatar === selectedAvatar;

                        return (
                            <button
                                key={avatar}
                                type="button"
                                aria-label={`Choisir l'avatar ${avatar}`}
                                aria-pressed={selected}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`flex aspect-square min-h-12 cursor-pointer items-center justify-center rounded-2xl text-3xl transition active:scale-95 sm:min-h-14 sm:text-4xl ${
                                    selected
                                        ? "bg-indigo-600 shadow-md ring-4 ring-indigo-100"
                                        : "border border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm"
                                }`}
                            >
                                {avatar}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

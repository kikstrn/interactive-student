"use client";

export const workshopGradeOptions = [
    { value: "", label: "Toutes les classes" },
    { value: "CP", label: "CP" },
    { value: "CE1", label: "CE1" },
    { value: "CE2", label: "CE2" },
    { value: "CM1", label: "CM1" },
    { value: "CM2", label: "CM2" },
];

export const workshopSourceOptions = [
    { value: "", label: "Toutes les sources" },
    { value: "official", label: "⭐ KLIKAO" },
    { value: "community", label: "👩‍🏫 Communauté" },
];

export type OfficialWorkshopFields = {
    is_official?: boolean | null;
    pack_grade?: string | null;
};

export function matchesOfficialWorkshopFilters(
    exercise: OfficialWorkshopFields,
    grade: string,
    source: string
) {
    if (
        grade &&
        exercise.pack_grade !== grade
    ) {
        return false;
    }

    if (
        source === "official" &&
        exercise.is_official !== true
    ) {
        return false;
    }

    if (
        source === "community" &&
        exercise.is_official === true
    ) {
        return false;
    }

    return true;
}

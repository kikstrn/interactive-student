"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
    name: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    autoComplete?: string;
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
    pattern?: string;
    placeholder?: string;
    className?: string;
};

export default function PasswordInput({
    name,
    minLength,
    maxLength,
    required,
    autoComplete,
    inputMode,
    pattern,
    placeholder,
    className = "",
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                name={name}
                type={visible ? "text" : "password"}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
                autoComplete={autoComplete}
                inputMode={inputMode}
                pattern={pattern}
                placeholder={placeholder}
                className={`${className} pr-12`}
            />

            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? "Masquer" : "Afficher"}
                title={visible ? "Masquer" : "Afficher"}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
                {visible ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
        </div>
    );
}

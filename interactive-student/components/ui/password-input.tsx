"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    autoComplete?: string;
    inputMode?:
        | "none"
        | "text"
        | "tel"
        | "url"
        | "email"
        | "numeric"
        | "decimal"
        | "search";
    pattern?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export default function PasswordInput({
    name,
    value,
    defaultValue,
    onChange,
    minLength,
    maxLength,
    required,
    autoComplete,
    inputMode,
    pattern,
    placeholder,
    disabled,
    className = "",
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                name={name}
                type={visible ? "text" : "password"}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
                autoComplete={autoComplete}
                inputMode={inputMode}
                pattern={pattern}
                placeholder={placeholder}
                disabled={disabled}
                className={`${className} pr-12`}
            />

            <button
                type="button"
                onClick={() =>
                    setVisible((current) => !current)
                }
                disabled={disabled}
                aria-label={
                    visible
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                }
                title={
                    visible
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                }
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {visible ? (
                    <EyeOff size={19} />
                ) : (
                    <Eye size={19} />
                )}
            </button>
        </div>
    );
}
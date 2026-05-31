"use client";

import React from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  error?: boolean;
  label?: string;
  leadingIcon?: React.ReactNode;
}

const sizeStyles = {
  sm: "px-2 py-1 text-xs rounded-md",
  md: "px-3 py-1.5 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-sm rounded-xl",
};

export default function Select({
  options,
  placeholder,
  size = "md",
  error,
  label,
  leadingIcon,
  className = "",
  id,
  ...props
}: SelectProps) {
  const reactId = React.useId();
  const selectId = id || `select-${reactId}`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leadingIcon}
          </span>
        )}
        <select
          id={selectId}
          className={`
            w-full appearance-none
            bg-bg-elevated text-text-primary
            border transition-all duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            pr-8
            ${leadingIcon ? "pl-9" : ""}
            ${error
              ? "border-accent-danger focus:ring-accent-danger/30"
              : "border-border-default hover:border-border-accent focus:border-accent-primary"
            }
            ${sizeStyles[size]}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

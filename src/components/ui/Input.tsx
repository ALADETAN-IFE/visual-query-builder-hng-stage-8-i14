"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "px-2 py-1 text-xs rounded-md",
  md: "px-3 py-1.5 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-sm rounded-xl",
};

export default function Input({
  label,
  error,
  icon,
  inputSize = "md",
  className = "",
  id,
  ...props
}: InputProps) {
  const reactId = React.useId();
  const inputId = id || `input-${reactId}`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full
            bg-bg-elevated text-text-primary
            placeholder:text-text-tertiary
            border transition-all duration-150
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? "pl-8" : ""}
            ${error
              ? "border-accent-danger focus:ring-accent-danger/30"
              : "border-border-default hover:border-border-accent focus:border-accent-primary"
            }
            ${sizeStyles[inputSize]}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-accent-danger flex items-center gap-1 animate-fade-in">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

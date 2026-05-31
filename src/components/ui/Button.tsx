"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-accent-primary text-text-inverse
    hover:bg-accent-primary-hover
    shadow-sm hover:shadow-md
    active:scale-[0.97]
  `,
  secondary: `
    bg-bg-elevated text-text-primary
    border border-border-default
    hover:border-border-accent hover:bg-bg-surface
    active:scale-[0.97]
  `,
  ghost: `
    bg-transparent text-text-secondary
    hover:bg-bg-elevated hover:text-text-primary
    active:scale-[0.97]
  `,
  danger: `
    bg-accent-danger/10 text-accent-danger
    border border-accent-danger/20
    hover:bg-accent-danger/20
    active:scale-[0.97]
  `,
  success: `
    bg-accent-success/10 text-accent-success
    border border-accent-success/20
    hover:bg-accent-success/20
    active:scale-[0.97]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1 rounded-md",
  md: "px-3.5 py-1.5 text-sm gap-1.5 rounded-lg",
  lg: "px-5 py-2.5 text-sm gap-2 rounded-xl",
};

export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium whitespace-nowrap
        transition-all duration-150 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary
        disabled:opacity-50 disabled:pointer-events-none
        cursor-pointer select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

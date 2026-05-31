"use client";

import React from "react";

type BadgeVariant = "and" | "or" | "sql" | "mongo" | "graphql" | "default" | "success" | "warning" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  and: "bg-accent-success/12 text-accent-success",
  or: "bg-accent-warning/12 text-accent-warning",
  sql: "bg-accent-primary/12 text-accent-primary",
  mongo: "bg-accent-success/12 text-accent-success",
  graphql: "bg-accent-danger/12 text-accent-danger",
  default: "bg-bg-elevated text-text-secondary",
  success: "bg-accent-success/12 text-accent-success",
  warning: "bg-accent-warning/12 text-accent-warning",
  danger: "bg-accent-danger/12 text-accent-danger",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
  dot,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        text-[0.6875rem] font-semibold
        tracking-wide uppercase
        rounded-full
        leading-relaxed
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`}
        />
      )}
      {children}
    </span>
  );
}

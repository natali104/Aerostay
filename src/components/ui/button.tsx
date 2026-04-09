"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[#1e3a5f] text-white hover:bg-[#162d4a] focus-visible:ring-[#1e3a5f]",
  secondary:
    "bg-[#38bdf8] text-[#0c1e2e] hover:bg-[#22a6e0] focus-visible:ring-[#38bdf8]",
  outline:
    "border border-[#1e3a5f] text-[#1e3a5f] bg-transparent hover:bg-[#1e3a5f]/5 focus-visible:ring-[#1e3a5f]",
  ghost:
    "text-[#1e3a5f] bg-transparent hover:bg-[#1e3a5f]/10 focus-visible:ring-[#1e3a5f]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2.5",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

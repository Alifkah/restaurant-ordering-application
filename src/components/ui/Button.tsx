"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark" | "outline-primary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles: 8px radius, bold weight, smooth transition, active scale
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-button transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    // Size mappings
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5",
    };

    // Variant mappings according to Stitch Culinary Core
    const variantStyles = {
      primary:
        "bg-primary hover:bg-primary-hover text-white shadow-elevation-1 border border-primary/20",
      secondary:
        "bg-white hover:bg-sand-50 text-stone-800 border border-sand-300 hover:border-sand-400 shadow-xs",
      "outline-primary":
        "bg-transparent border border-primary text-primary hover:bg-primary-50",
      ghost:
        "bg-transparent hover:bg-sand-200/60 text-stone-700 hover:text-stone-900",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-elevation-1",
      dark:
        "bg-obsidian-900 hover:bg-obsidian-800 text-white shadow-elevation-1",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

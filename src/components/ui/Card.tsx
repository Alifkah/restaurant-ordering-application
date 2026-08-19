"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3;
  variant?: "surface" | "glass" | "kds" | "outline";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, elevation = 1, variant = "surface", className = "", ...props }, ref) => {
    const elevationStyles = {
      0: "shadow-none",
      1: "shadow-elevation-1",
      2: "shadow-elevation-2",
      3: "shadow-elevation-3",
    };

    const variantStyles = {
      surface: "bg-white border border-sand-300/80 text-stone-900",
      glass: "glass-card text-stone-900",
      kds: "bg-kds-surface border border-kds-border text-kds-text",
      outline: "bg-transparent border border-sand-300 text-stone-900",
    };

    return (
      <div
        ref={ref}
        className={`rounded-card transition-all ${elevationStyles[elevation]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;

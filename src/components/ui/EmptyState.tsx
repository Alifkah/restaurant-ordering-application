"use client";

import React from "react";
import { UtensilsCrossed } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-card bg-white border border-sand-300 shadow-elevation-1 flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-sand-100 border border-sand-300 text-stone-400 flex items-center justify-center shadow-xs">
        {icon || <UtensilsCrossed className="w-8 h-8 text-primary/70" />}
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-heading font-bold text-lg text-stone-900 leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

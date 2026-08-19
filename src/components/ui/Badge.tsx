"use client";

import React from "react";
import { Sparkles, Flame, Clock, CheckCircle2, AlertCircle, UtensilsCrossed, ShoppingBag } from "lucide-react";

export type BadgeVariant =
  | "default"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "dine_in"
  | "takeaway"
  | "bestseller"
  | "spicy"
  | "terracotta";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  showIcon = false,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-sand-200 text-stone-700 border border-sand-300",
    pending: "bg-blue-50 text-blue-700 border border-blue-200",
    confirmed: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    preparing: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold",
    ready: "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-glow-ready/20",
    completed: "bg-stone-100 text-stone-600 border border-stone-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
    dine_in: "bg-primary-50 text-primary-700 border border-primary-200 font-semibold",
    takeaway: "bg-stone-100 text-stone-700 border border-stone-300",
    bestseller: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
    spicy: "bg-red-100 text-red-800 border border-red-300 font-bold",
    terracotta: "bg-primary text-white font-semibold shadow-xs",
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (variant) {
      case "bestseller":
        return <Sparkles className="w-3 h-3 text-amber-600" />;
      case "spicy":
        return <Flame className="w-3 h-3 text-red-600" />;
      case "preparing":
        return <Clock className="w-3 h-3 text-amber-600 animate-pulse" />;
      case "ready":
        return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      case "cancelled":
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      case "dine_in":
        return <UtensilsCrossed className="w-3 h-3 text-primary" />;
      case "takeaway":
        return <ShoppingBag className="w-3 h-3 text-stone-600" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-badge font-medium uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

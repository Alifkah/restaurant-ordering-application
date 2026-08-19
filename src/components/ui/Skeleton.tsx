"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  className = "",
  ...props
}) => {
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-button",
    card: "rounded-card",
  };

  return (
    <div
      className={`animate-pulse bg-sand-200/80 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;

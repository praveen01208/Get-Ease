import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-panel";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-surface border border-border rounded-2xl",
      glass: "glass-card",
      "glass-panel": "glass-panel",
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const GlassCard = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => <Card ref={ref} variant="glass" {...props} />
);
GlassCard.displayName = "GlassCard";

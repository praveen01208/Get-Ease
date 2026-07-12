import React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export const Heading = ({ className, as: Component = "h2", ...props }: TypographyProps) => {
  return (
    <Component
      className={cn("font-bold tracking-tight text-primary text-balance", className)}
      {...props}
    />
  );
};

export const Text = ({ className, as: Component = "p", ...props }: TypographyProps) => {
  return (
    <Component
      className={cn("text-secondary leading-relaxed", className)}
      {...props}
    />
  );
};

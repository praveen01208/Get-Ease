import React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = ({ src, alt, size = "md", className, ...props }: AvatarProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-surface border border-border items-center justify-center",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || "Avatar"} className="aspect-square h-full w-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-secondary" />
      )}
    </div>
  );
};

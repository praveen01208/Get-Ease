import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 text-secondary pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border border-border bg-surface/50 px-4 py-2 text-sm text-primary placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, "icon">>(
  (props, ref) => <Input ref={ref} icon={<Search className="w-5 h-5" />} {...props} />
);
SearchInput.displayName = "SearchInput";

export const SearchBar = forwardRef<HTMLInputElement, Omit<InputProps, "icon">>(
  ({ className, ...props }, ref) => (
    <Input 
      ref={ref} 
      icon={<Search className="w-5 h-5 text-secondary" />} 
      className={cn("h-14 rounded-2xl glass text-base", className)} 
      {...props} 
    />
  )
);
SearchBar.displayName = "SearchBar";

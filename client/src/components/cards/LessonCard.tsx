import React from "react";
import { GlassCard } from "@/components/ui/Card";
import { PlayCircle, FileText, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LessonCardProps {
  title: string;
  duration: string;
  type: "video" | "document" | "assignment";
  isLocked?: boolean;
  isCompleted?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const LessonCard = ({
  title,
  duration,
  type,
  isLocked = false,
  isCompleted = false,
  isActive = false,
  onClick,
}: LessonCardProps) => {
  const Icon = type === "video" ? PlayCircle : FileText;

  return (
    <GlassCard 
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        "p-4 flex items-center gap-4 transition-all duration-200",
        isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-surface/80",
        isActive && "border-primary/50 shadow-md shadow-primary/5"
      )}
    >
      <div className={cn(
        "flex items-center justify-center shrink-0 w-10 h-10 rounded-full",
        isActive ? "bg-primary/20 text-primary" : "bg-surface text-secondary"
      )}>
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-medium text-sm sm:text-base truncate",
          isActive ? "text-primary" : "text-primary/90"
        )}>
          {title}
        </h4>
        <span className="text-xs text-secondary">{duration}</span>
      </div>
      
      {isLocked && <Lock className="w-4 h-4 text-secondary shrink-0" />}
    </GlassCard>
  );
};

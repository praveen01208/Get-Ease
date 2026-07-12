import React from 'react';
import { Lock, PlayCircle, CheckCircle2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LessonState = 'preview' | 'locked' | 'continue' | 'completed' | 'current';

interface LessonCardProps {
  title: string;
  duration?: number;
  state: LessonState;
  onClick: () => void;
  isActive?: boolean; // Currently selected in the player sidebar
}

export const LessonCard = ({ title, duration, state, onClick, isActive }: LessonCardProps) => {
  
  const getIcon = () => {
    switch (state) {
      case 'preview': return <PlayCircle className="w-5 h-5 text-success" />;
      case 'locked': return <Lock className="w-5 h-5 text-secondary" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-brand-500" />;
      case 'current': return <Navigation className="w-5 h-5 text-brand-400 fill-current rotate-45" />;
      case 'continue': return <PlayCircle className="w-5 h-5 text-primary" />;
      default: return <PlayCircle className="w-5 h-5 text-secondary" />;
    }
  };

  const getLabel = () => {
    switch (state) {
      case 'preview': return <span className="text-[10px] font-bold text-success uppercase tracking-wider">Free Preview</span>;
      case 'locked': return <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Locked</span>;
      case 'completed': return <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Completed</span>;
      case 'current': return <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Current</span>;
      case 'continue': return null;
    }
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border",
        isActive 
          ? "bg-white/10 border-white/20 shadow-lg" 
          : "bg-surface hover:bg-white/5 border-transparent",
        state === 'locked' && "opacity-75 hover:opacity-100"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
        isActive ? "bg-white/10" : "bg-white/5 group-hover:bg-white/10"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex justify-between items-start mb-1">
          <h4 className={cn(
            "font-medium truncate pr-2 text-sm",
            isActive ? "text-white" : "text-primary",
            state === 'locked' && "text-secondary"
          )}>
            {title}
          </h4>
          {duration ? (
            <span className="text-xs text-secondary shrink-0">{formatDuration(duration)}</span>
          ) : null}
        </div>
        
        <div className="flex items-center mt-1">
          {getLabel()}
        </div>
      </div>
    </div>
  );
};

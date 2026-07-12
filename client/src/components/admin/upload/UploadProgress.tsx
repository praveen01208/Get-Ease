import React from 'react';
import { cn } from '@/utils/cn';

interface UploadProgressProps {
  progress: number;
  label?: string;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress, label, className }) => (
  <div className={cn('w-full space-y-2', className)}>
    {label && <p className="text-xs text-secondary">{label}</p>}
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
    <p className="text-xs text-secondary text-right">{progress}%</p>
  </div>
);

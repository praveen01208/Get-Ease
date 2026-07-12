import React from 'react';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const configs: Record<string, { label: string; classes: string }> = {
  DRAFT:      { label: 'Draft',      classes: 'bg-white/[0.06] text-secondary border-white/[0.08]' },
  PRIVATE:    { label: 'Private',    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PUBLISHED:  { label: 'Published',  classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
  ARCHIVED:   { label: 'Archived',   classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
  QUEUED:     { label: 'Queued',     classes: 'bg-white/[0.06] text-secondary border-white/[0.08]' },
  UPLOADING:  { label: 'Uploading',  classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  PROCESSING: { label: 'Processing', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  COMPLETED:  { label: 'Completed',  classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
  FAILED:     { label: 'Failed',     classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const cfg = configs[status.toUpperCase()] || { label: status, classes: 'bg-white/[0.06] text-secondary border-white/[0.08]' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', cfg.classes, className)}>
      {cfg.label}
    </span>
  );
};

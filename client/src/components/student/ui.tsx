import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ProgressBar = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden', className)}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-white/80 to-white/50 transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const SectionHeader = ({
  title,
  subtitle,
  to,
  linkLabel = 'View all',
}: {
  title: string;
  subtitle?: string;
  to?: string;
  linkLabel?: string;
}) => (
  <div className="flex items-end justify-between mb-5">
    <div>
      <h2 className="text-xl font-bold text-primary tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-secondary mt-0.5">{subtitle}</p>}
    </div>
    {to && (
      <Link
        to={to}
        className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors shrink-0"
      >
        {linkLabel} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}) => (
  <div className="glass-card py-14 px-8 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-5">
      <Icon className="w-7 h-7 text-secondary" />
    </div>
    <h3 className="text-lg font-bold text-primary mb-1.5">{title}</h3>
    <p className="text-sm text-secondary max-w-sm mb-6">{message}</p>
    {action}
  </div>
);

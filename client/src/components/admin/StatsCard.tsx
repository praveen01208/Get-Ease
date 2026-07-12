import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, className }) => (
  <div className={cn('glass-card p-6 rounded-2xl', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-primary/60">
        {icon}
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs font-semibold',
          trend.value >= 0 ? 'text-green-400' : 'text-red-400'
        )}>
          {trend.value >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-primary tracking-tight">{value}</p>
    <p className="text-sm text-secondary mt-1">{title}</p>
  </div>
);

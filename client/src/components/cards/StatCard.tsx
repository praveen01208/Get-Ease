import React from "react";
import { GlassCard } from "@/components/ui/Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-primary">{value}</h3>
          
          {trend && (
            <p className="text-xs mt-2 flex items-center gap-1">
              <span className={trend.isPositive ? "text-success" : "text-danger"}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-secondary">from last month</span>
            </p>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-surface rounded-xl border border-border/50 text-secondary">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, change, icon, ...props }, ref) => {
    const changeColors = {
      increase: "text-emerald-600 bg-emerald-50",
      decrease: "text-red-600 bg-red-50",
      neutral: "text-gray-600 bg-gray-50",
    };

    const changeIcons = {
      increase: "↑",
      decrease: "↓",
      neutral: "→",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-[#1e3a5f]">
              {value}
            </p>
          </div>
          {icon && (
            <div className="rounded-lg bg-[#1e3a5f]/5 p-2.5 text-[#1e3a5f]">
              {icon}
            </div>
          )}
        </div>
        {change && (
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                changeColors[change.type]
              )}
            >
              {changeIcons[change.type]} {Math.abs(change.value)}%
            </span>
            <span className="text-xs text-gray-400">vs last period</span>
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };

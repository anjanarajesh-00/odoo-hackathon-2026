import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  isLoading,
  isError,
  onRetry,
  tooltip,
}) => {
  if (isLoading) {
    return (
      <div className="p-5 bg-card border border-border rounded-xl shadow-sm animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="w-8 h-8 bg-muted rounded-lg" />
        </div>
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 bg-card border border-rose-200 rounded-xl shadow-sm space-y-2 text-center text-xs">
        <p className="text-rose-600 font-semibold">Failed to load {title}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 rounded border border-rose-200 hover:bg-rose-100"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <Link
      to={href}
      title={tooltip}
      className="p-5 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 hover:shadow transition-all group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1 my-2">
        <div className="text-2xl font-black text-foreground tracking-tight flex items-center justify-between">
          <span>{value}</span>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Link>
  );
};


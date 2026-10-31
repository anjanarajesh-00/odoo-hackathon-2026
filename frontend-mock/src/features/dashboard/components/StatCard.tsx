import React from "react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
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
  href,
  isLoading,
  isError,
  onRetry,
  tooltip,
}) => {
  if (isLoading) {
    return (
      <div className="p-5 bg-card border border-border rounded-container animate-pulse space-y-3">
        <div className="h-4 bg-muted rounded-control w-1/2" />
        <div className="h-8 bg-muted rounded-control w-3/4" />
        <div className="h-3 bg-muted rounded-control w-1/3" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 bg-card border border-danger-border rounded-container space-y-2 text-center text-xs">
        <p className="text-danger-cinnabar font-medium">Failed to load {title}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 text-[11px] font-medium bg-danger-tint text-danger-cinnabar rounded-control border border-danger-border"
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
      className="p-5 bg-card border border-border rounded-container hover:border-brand-verdigris transition-colors group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-secondary">
          {title}
        </span>
      </div>

      <div className="space-y-1 my-2">
        <div className="text-[28px] font-serif text-ink-primary leading-tight tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-ink-secondary">{subtitle}</p>
        )}
      </div>
    </Link>
  );
};


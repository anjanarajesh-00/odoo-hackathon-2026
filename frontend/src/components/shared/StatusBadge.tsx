import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, type DisplayStatus } from "@/types/enums";

interface StatusBadgeProps {
  status: DisplayStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
}) => {
  const normalized = (status || "").toLowerCase() as DisplayStatus;
  const config = STATUS_COLORS[normalized] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border",
        config.bg,
        config.text,
        config.border || "border-transparent",
        className
      )}
    >
      {config.label}
    </span>
  );
};


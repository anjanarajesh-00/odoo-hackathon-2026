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
    dot: "#8C8982",
    text: "#575551",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: status,
  };

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border || "#DCDAD4",
      }}
      className={cn(
        "inline-flex items-center gap-[6px] px-2 py-[2px] rounded-control text-xs font-medium border shrink-0",
        className
      )}
    >
      <span
        style={{ backgroundColor: config.dot }}
        className="w-[6px] h-[6px] rounded-full shrink-0"
      />
      <span>{config.label}</span>
    </span>
  );
};

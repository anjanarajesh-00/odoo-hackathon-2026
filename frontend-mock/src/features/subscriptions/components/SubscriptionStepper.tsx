import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types/enums";

interface SubscriptionStepperProps {
  currentStatus: SubscriptionStatus;
  className?: string;
}

const STEPS: { status: SubscriptionStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "quotation", label: "Quotation" },
  { status: "confirmed", label: "Confirmed" },
  { status: "active", label: "Active" },
  { status: "closed", label: "Closed" },
];

export const SubscriptionStepper: React.FC<SubscriptionStepperProps> = ({
  currentStatus,
  className,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className={cn("w-full py-2", className)}>
      {/* Horizontal on Desktop, scrollable on mobile */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2 sm:gap-0 no-scrollbar">
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isClosedTerminal = currentStatus === "closed" && step.status === "closed";

          return (
            <React.Fragment key={step.status}>
              {/* Step Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isCurrent
                      ? isClosedTerminal
                        ? "bg-slate-700 text-white ring-4 ring-slate-100"
                        : "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-sm"
                      : isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {isPassed ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap",
                    isCurrent
                      ? "text-foreground font-bold"
                      : isPassed
                      ? "text-emerald-700"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 min-w-[20px] transition-colors",
                    idx < currentIndex ? "bg-emerald-600" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


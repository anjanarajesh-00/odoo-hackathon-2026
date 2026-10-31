import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkPasswordRules } from "../schemas";

interface PasswordRulesProps {
  password?: string;
  className?: string;
}

export const PasswordRules: React.FC<PasswordRulesProps> = ({
  password = "",
  className,
}) => {
  const rules = checkPasswordRules(password);

  const items = [
    { label: "More than 8 characters (min. 9)", valid: rules.minChars },
    { label: "At least one uppercase letter", valid: rules.hasUpper },
    { label: "At least one lowercase letter", valid: rules.hasLower },
    { label: "At least one special character", valid: rules.hasSpecial },
  ];

  return (
    <div className={cn("p-3 rounded-lg bg-muted/40 border border-border space-y-1.5 text-xs", className)}>
      <p className="font-semibold text-foreground/80 mb-1">
        Password requirements:
      </p>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "flex items-center gap-2 transition-colors",
            item.valid ? "text-emerald-600 font-medium" : "text-muted-foreground"
          )}
        >
          {item.valid ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
          ) : (
            <X className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 stroke-[2.5]" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};


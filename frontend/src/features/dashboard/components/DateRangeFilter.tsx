import React from "react";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  preset: string;
  onChange: (range: { dateFrom: string; dateTo: string; preset: string }) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateFrom,
  dateTo,
  preset,
  onChange,
}) => {
  const handlePresetSelect = (selectedPreset: string) => {
    const now = new Date();
    let from = "";
    let to = now.toISOString().split("T")[0];

    if (selectedPreset === "this_month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    } else if (selectedPreset === "last_month") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
      to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    } else if (selectedPreset === "last_3_months") {
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split("T")[0];
    } else if (selectedPreset === "this_year") {
      from = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
    }

    onChange({ dateFrom: from, dateTo: to, preset: selectedPreset });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs flex-wrap">
      {/* Preset Buttons */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border flex-wrap">
        {[
          { key: "this_month", label: "This Month" },
          { key: "last_month", label: "Last Month" },
          { key: "last_3_months", label: "Last 3 Months" },
          { key: "this_year", label: "This Year" },
          { key: "custom", label: "Custom" },
        ].map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              if (p.key !== "custom") {
                handlePresetSelect(p.key);
              } else {
                onChange({ dateFrom, dateTo, preset: "custom" });
              }
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              preset === p.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Calendar className="w-3.5 h-3.5" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) =>
            onChange({ dateFrom: e.target.value, dateTo, preset: "custom" })
          }
          className="px-2 py-1 bg-card border border-border rounded text-foreground text-xs focus:ring-1 focus:ring-primary"
        />
        <span>→</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) =>
            onChange({ dateFrom, dateTo: e.target.value, preset: "custom" })
          }
          className="px-2 py-1 bg-card border border-border rounded text-foreground text-xs focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
};


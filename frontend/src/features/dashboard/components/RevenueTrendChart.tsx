import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueTrendPoint, TrendGroupBy } from "../schemas";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, RefreshCw } from "lucide-react";

interface RevenueTrendChartProps {
  data?: RevenueTrendPoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  groupBy: TrendGroupBy;
  onGroupByChange: (groupBy: TrendGroupBy) => void;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data = [],
  isLoading,
  isError,
  onRetry,
  groupBy,
  onGroupByChange,
}) => {
  return (
    <div className="p-5 bg-card border border-border rounded-container flex flex-col justify-between space-y-4">
      {/* Header with GroupBy override toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Recurring Revenue Trend
          </h3>
          <p className="text-xs text-muted-foreground">
            Collections over time
          </p>
        </div>

        {/* Override controls */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-control text-xs">
          {(["day", "week", "month"] as TrendGroupBy[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGroupByChange(g)}
              className={`px-2 py-0.5 rounded-control capitalize font-medium transition-colors ${
                groupBy === g
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full flex items-center justify-center">
        {isLoading ? (
          <div className="w-full h-full bg-muted/30 animate-pulse rounded-container flex items-center justify-center text-xs text-muted-foreground">
            Loading revenue data...
          </div>
        ) : isError ? (
          <div className="text-center space-y-2">
            <p className="text-xs text-danger-cinnabar font-medium">
              Failed to load revenue trend chart
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-danger-tint text-danger-cinnabar border border-danger-border rounded-control"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : data.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center">
            No collection data recorded for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
              <XAxis
                dataKey="label"
                stroke="var(--ink-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--ink-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                contentStyle={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-hairline)",
                  borderRadius: "var(--radius-control)",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-modal)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--brand-verdigris)"
                strokeWidth={1.5}
                fillOpacity={0.6}
                fill="var(--brand-tint)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};


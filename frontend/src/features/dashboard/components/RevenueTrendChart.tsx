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
    <div className="p-5 bg-card border border-border rounded-xl shadow-sm flex flex-col justify-between space-y-4">
      {/* Header with GroupBy override toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Recurring Revenue Trend
            </h3>
            <p className="text-xs text-muted-foreground">
              Collections over time
            </p>
          </div>
        </div>

        {/* Override controls */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
          {(["day", "week", "month"] as TrendGroupBy[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGroupByChange(g)}
              className={`px-2 py-0.5 rounded capitalize font-semibold transition-colors ${
                groupBy === g
                  ? "bg-card text-foreground shadow-sm"
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
          <div className="w-full h-full bg-muted/30 animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">
            Loading revenue data...
          </div>
        ) : isError ? (
          <div className="text-center space-y-2">
            <p className="text-xs text-rose-600 font-medium">
              Failed to load revenue trend chart
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100"
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
              <defs>
                <linearGradient id="revenueTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueTeal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};


import React from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SubscriptionsByStatusItem } from "../schemas";
import { PieChart as PieIcon, RefreshCw } from "lucide-react";
import type { SubscriptionStatus } from "@/types/enums";

// Matching StatusBadge colors dynamically via DESIGN.md semantic mappings
const STATUS_CHART_COLORS: Record<SubscriptionStatus, string> = {
  active: "#0A5C52",     // Brand Verdigris
  confirmed: "#1D4ED8",  // Info Cobalt
  quotation: "#C27803",  // Warn Ochre
  draft: "#8C8982",      // Ash / Ink Muted
  closed: "#141413",     // Deep Carbon
};

interface StatusDonutProps {
  data?: SubscriptionsByStatusItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const StatusDonut: React.FC<StatusDonutProps> = ({
  data = [],
  isLoading,
  isError,
  onRetry,
}) => {
  const navigate = useNavigate();

  const totalSubs = data.reduce((sum, item) => sum + item.count, 0);

  const handleSegmentClick = (status: SubscriptionStatus) => {
    navigate(`/subscriptions?status=${status}`);
  };

  return (
    <div className="p-5 bg-card border border-border rounded-container flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Subscriptions by Status
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            Total: {totalSubs} contracts
          </p>
        </div>
      </div>

      {/* Donut Canvas */}
      <div className="h-[280px] w-full flex items-center justify-center">
        {isLoading ? (
          <div className="w-full h-full bg-muted/30 animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">
            Loading subscription distribution...
          </div>
        ) : isError ? (
          <div className="text-center space-y-2">
            <p className="text-xs text-rose-600 font-medium">
              Failed to load status breakdown
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
        ) : totalSubs === 0 ? (
          <div className="text-xs text-muted-foreground text-center">
            No subscriptions available.
          </div>
        ) : (
          <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} subscriptions`, name]}
                    contentStyle={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-hairline)",
                      borderRadius: "var(--radius-control)",
                      fontSize: "12px",
                      boxShadow: "var(--shadow-modal)",
                    }}
                  />
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    onClick={(entry) => handleSegmentClick(entry.status as SubscriptionStatus)}
                    className="cursor-pointer"
                  >
                    {data.map((entry) => (
                      <Cell
                        key={`cell-${entry.status}`}
                        fill={STATUS_CHART_COLORS[entry.status as SubscriptionStatus] || "var(--brand-verdigris)"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Donut Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-foreground">{totalSubs}</span>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Legend with interactive deep link clicks */}
            <div className="flex sm:flex-col flex-wrap gap-2 text-xs">
              {data.map((item) => (
                <button
                  key={item.status}
                  onClick={() => handleSegmentClick(item.status)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-colors text-left"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_CHART_COLORS[item.status] }}
                  />
                  <span className="capitalize text-muted-foreground hover:text-foreground">
                    {item.status}: <strong className="text-foreground">{item.count}</strong>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


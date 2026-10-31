import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/auth.store";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  usePlanAction,
} from "../api";
import { planSchema, renewPlanSchema, type Plan, type PlanInput, type RenewPlanInput } from "../schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type PaginationState } from "@/components/shared/DataTable";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterBar } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PlanFormFields } from "../components/PlanFormFields";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Plus, Edit2, Pause, Play, AlertCircle, RefreshCw, AlertTriangle } from "lucide-react";

export const PlansPage: React.FC = () => {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin";

  const [searchParams, setSearchParams] = useSearchParams();

  // URL State persistence
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";
  const stateFilter = searchParams.get("state") || "all";
  const billingPeriod = searchParams.get("billingPeriod") || "all";
  const sort = searchParams.get("sort") || "name:asc";

  const updateParams = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === "all") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next, { replace: true });
  };

  // Queries & Mutations
  const { data, isLoading } = usePlans({
    page,
    pageSize,
    search,
    state: stateFilter === "all" ? undefined : stateFilter,
    billingPeriod: billingPeriod === "all" ? undefined : billingPeriod,
    sort,
  });

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const planActionMutation = usePlanAction();

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [renewPlan, setRenewPlan] = useState<Plan | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    plan: Plan;
    action: "pause" | "resume" | "close";
    title: string;
    description: string;
  } | null>(null);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: PlanInput) => {
    if (editingPlan) {
      await updateMutation.mutateAsync({ id: editingPlan.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setFormOpen(false);
  };

  const handleExecuteAction = async () => {
    if (!actionConfirm) return;
    await planActionMutation.mutateAsync({
      id: actionConfirm.plan.id,
      action: actionConfirm.action,
    });
    setActionConfirm(null);
  };

  const handleRenewSubmit = async (values: RenewPlanInput) => {
    if (!renewPlan) return;
    await planActionMutation.mutateAsync({
      id: renewPlan.id,
      action: "renew",
      body: { availableTo: values.availableTo },
    });
    setRenewPlan(null);
  };

  // Columns definition
  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Recurring Price",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.price)}
        </span>
      ),
    },
    {
      accessorKey: "billingPeriod",
      header: "Billing Period",
      cell: ({ row }) => (
        <span className="capitalize px-2 py-0.5 rounded text-xs bg-muted text-foreground font-medium">
          {row.original.billingPeriod}
        </span>
      ),
    },
    {
      accessorKey: "minQuantity",
      header: "Min Qty",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.minQuantity}</span>
      ),
    },
    {
      id: "availability",
      header: "Availability Window",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <span>{formatDate(row.original.availableFrom)}</span>
          <span className="mx-1">→</span>
          <span>{formatDate(row.original.availableTo)}</span>
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => <StatusBadge status={row.original.state} />,
    },
    ...(isAdmin
      ? ([
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: Plan } }) => {
              const p = row.original;
              const canPause = p.allowPause && p.state === "open";
              const canResume = p.state === "paused";
              const canClose = p.allowEarlyClose && p.state !== "closed";
              const canRenew = p.allowRenew;

              return (
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Pause Action */}
                  {canPause && (
                    <button
                      onClick={() =>
                        setActionConfirm({
                          plan: p,
                          action: "pause",
                          title: "Pause Plan?",
                          description: `Temporarily suspend new subscriptions for "${p.name}".`,
                        })
                      }
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Pause Plan"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}

                  {/* Resume Action */}
                  {canResume && (
                    <button
                      onClick={() =>
                        setActionConfirm({
                          plan: p,
                          action: "resume",
                          title: "Resume Plan?",
                          description: `Reactivate "${p.name}" to accept subscriptions.`,
                        })
                      }
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="Resume Plan"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {/* Close Early Action */}
                  {canClose && (
                    <button
                      onClick={() =>
                        setActionConfirm({
                          plan: p,
                          action: "close",
                          title: "Close Plan Early?",
                          description: `Close "${p.name}" early before its scheduled end date.`,
                        })
                      }
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                      title="Close Early"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  )}

                  {/* Renew Action */}
                  {canRenew && (
                    <button
                      onClick={() => setRenewPlan(p)}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Renew / Extend Plan"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            },
          },
        ] as ColumnDef<Plan>[])
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Subscription Plans"
        description="Configure recurring billing frequencies, minimum order thresholds, and lifecycle rules."
        actions={
          isAdmin ? (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => updateParams({ search: val, page: 1 })}
        searchPlaceholder="Search plans by name..."
        filters={[
          {
            key: "state",
            label: "Plan State",
            value: stateFilter,
            options: [
              { label: "All States", value: "all" },
              { label: "Open", value: "open" },
              { label: "Paused", value: "paused" },
              { label: "Closed", value: "closed" },
            ],
            onChange: (val) => updateParams({ state: val, page: 1 }),
          },
          {
            key: "billingPeriod",
            label: "Billing Period",
            value: billingPeriod,
            options: [
              { label: "All Frequencies", value: "all" },
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ],
            onChange: (val) => updateParams({ billingPeriod: val, page: 1 }),
          },
        ]}
      />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        isLoading={isLoading}
        pagination={{ page, pageSize }}
        onPaginationChange={(p: PaginationState) =>
          updateParams({ page: p.page, pageSize: p.pageSize })
        }
        emptyMessage="No plans found matching the filters."
      />

      {/* Create / Edit FormDialog */}
      {isAdmin && (
        <FormDialog<PlanInput>
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editingPlan ? "Edit Plan" : "Create Subscription Plan"}
          description={
            editingPlan
              ? `Adjust pricing, billing intervals and flags for "${editingPlan.name}"`
              : "Set up pricing frequency and subscription renewal behavior"
          }
          schema={planSchema}
          defaultValues={
            editingPlan
              ? {
                  name: editingPlan.name,
                  price: editingPlan.price,
                  billingPeriod: editingPlan.billingPeriod,
                  minQuantity: editingPlan.minQuantity,
                  availableFrom: editingPlan.availableFrom,
                  availableTo: editingPlan.availableTo,
                  autoClose: editingPlan.autoClose,
                  allowEarlyClose: editingPlan.allowEarlyClose,
                  allowPause: editingPlan.allowPause,
                  allowRenew: editingPlan.allowRenew,
                }
              : {
                  name: "",
                  price: 999,
                  billingPeriod: "monthly",
                  minQuantity: 1,
                  availableFrom: new Date().toISOString().split("T")[0],
                  availableTo: new Date(Date.now() + 365 * 86400000)
                    .toISOString()
                    .split("T")[0],
                  autoClose: false,
                  allowEarlyClose: true,
                  allowPause: true,
                  allowRenew: true,
                }
          }
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          submitLabel={editingPlan ? "Save Plan" : "Create Plan"}
        >
          {(form) => (
            <PlanFormFields
              register={form.register}
              errors={form.formState.errors}
            />
          )}
        </FormDialog>
      )}

      {/* Renew Dialog */}
      {renewPlan && (
        <FormDialog<RenewPlanInput>
          open={Boolean(renewPlan)}
          onOpenChange={(open) => !open && setRenewPlan(null)}
          title={`Renew Plan: ${renewPlan.name}`}
          description="Extend the availability window for this subscription plan."
          schema={renewPlanSchema}
          defaultValues={{
            availableTo: new Date(Date.now() + 180 * 86400000)
              .toISOString()
              .split("T")[0],
          }}
          onSubmit={handleRenewSubmit}
          isLoading={planActionMutation.isPending}
          submitLabel="Renew Plan"
        >
          {(form) => (
            <div className="space-y-3 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  New Available To (End Date) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  {...form.register("availableTo")}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
                {form.formState.errors.availableTo && (
                  <p className="text-xs text-rose-500 font-medium">
                    {form.formState.errors.availableTo.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </FormDialog>
      )}

      {/* Action Confirmation Modal (Pause, Resume, Close Early) */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {actionConfirm.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {actionConfirm.description}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActionConfirm(null)}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={planActionMutation.isPending}
                onClick={handleExecuteAction}
                className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50"
              >
                {planActionMutation.isPending ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


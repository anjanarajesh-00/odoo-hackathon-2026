import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/auth.store";
import {
  useSubscriptions,
  useCreateSubscription,
  useCustomersLookup,
  useTaxes,
  useQuotationTemplates,
} from "../api";
import { usePlans } from "@/features/plans/api";
import { useProducts } from "@/features/products/api";
import {
  subscriptionFormSchema,
  type Subscription,
  type SubscriptionFormInput,
} from "../schemas";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type PaginationState } from "@/components/shared/DataTable";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterBar } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SubscriptionFormFields } from "../components/SubscriptionFormFields";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Plus, Eye, Clock, ShieldAlert } from "lucide-react";

export const SubscriptionsPage: React.FC = () => {
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state persistence
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const planIdFilter = searchParams.get("planId") || "all";
  const expiringBefore = searchParams.get("expiringBefore") || "";
  const sort = searchParams.get("sort") || "createdAt:desc";

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

  // Queries
  const { data, isLoading } = useSubscriptions({
    page,
    pageSize,
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    planId: planIdFilter === "all" ? undefined : planIdFilter,
    expiringBefore: expiringBefore || undefined,
    sort,
  });

  const { data: customers } = useCustomersLookup();
  const { data: plansData } = usePlans({ pageSize: 100 });
  const { data: productsData } = useProducts({ pageSize: 100 });
  const { data: taxes } = useTaxes();
  const { data: templates } = useQuotationTemplates();

  const createMutation = useCreateSubscription();

  const [formOpen, setFormOpen] = useState(false);

  const isAttentionFilterActive = Boolean(expiringBefore);

  const toggleAttentionFilter = () => {
    if (isAttentionFilterActive) {
      updateParams({ expiringBefore: "", page: 1 });
    } else {
      const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      updateParams({ expiringBefore: in30Days, page: 1 });
    }
  };

  const handleCreateSubmit = async (values: SubscriptionFormInput, form: any) => {
    const selectedPlan = plansData?.data.find((p) => p.id === values.planId);
    if (selectedPlan) {
      for (let i = 0; i < values.lines.length; i++) {
        if (values.lines[i].quantity < selectedPlan.minQuantity) {
          form.setError(`lines.${i}.quantity` as any, {
            type: "manual",
            message: `Minimum quantity for ${selectedPlan.name} is ${selectedPlan.minQuantity}`,
          });
          return;
        }
      }
    }

    const created = await createMutation.mutateAsync(values);
    setFormOpen(false);
    navigate(`/subscriptions/${created.id}`);
  };

  // Columns definition
  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "number",
      header: "Subscription #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          {row.original.number}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">
            {row.original.customer.name}
          </div>
          {row.original.customer.email && (
            <div className="text-xs text-muted-foreground">
              {row.original.customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">
            {row.original.plan.name}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {row.original.plan.billingPeriod} billing
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.startDate)}</span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => {
        const expiry = new Date(row.original.expiryDate).getTime();
        const now = Date.now();
        const daysLeft = Math.ceil((expiry - now) / 86400000);
        const isExpiringSoon = daysLeft <= 30 && daysLeft > 0 && row.original.status === "active";

        return (
          <div className="space-y-0.5">
            <span className="text-foreground">{formatDate(row.original.expiryDate)}</span>
            {isExpiringSoon && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 block w-fit">
                <Clock className="w-3 h-3" />
                {daysLeft} days left
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/subscriptions/${row.original.id}`);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Subscriptions"
        description="Track active recurring customer contracts, send quotations, and manage lifecycle renewals."
        actions={
          role !== "customer" ? (
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Subscription</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar with Quick Attention Chip */}
      <div className="space-y-2">
        <FilterBar
          search={search}
          onSearchChange={(val) => updateParams({ search: val, page: 1 })}
          searchPlaceholder="Search by subscription # or customer name..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "All Statuses", value: "all" },
                { label: "Draft", value: "draft" },
                { label: "Quotation", value: "quotation" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Active", value: "active" },
                { label: "Closed", value: "closed" },
              ],
              onChange: (val) => updateParams({ status: val, page: 1 }),
            },
            {
              key: "planId",
              label: "Plan",
              value: planIdFilter,
              options: [
                { label: "All Plans", value: "all" },
                ...(plansData?.data || []).map((p) => ({
                  label: p.name,
                  value: p.id,
                })),
              ],
              onChange: (val) => updateParams({ planId: val, page: 1 }),
            },
          ]}
        />

        {/* Quick Filter Pill: Expiring in 30 Days */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAttentionFilter}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isAttentionFilterActive
                ? "bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-300/40"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Needs Attention: Expiring within 30 days</span>
          </button>
        </div>
      </div>

      {/* Main DataTable with onRowClick to detail page */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        isLoading={isLoading}
        pagination={{ page, pageSize }}
        onPaginationChange={(p: PaginationState) =>
          updateParams({ page: p.page, pageSize: p.pageSize })
        }
        onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
        emptyMessage="No subscriptions found matching your filters."
      />

      {/* Create Subscription Dialog */}
      <FormDialog<SubscriptionFormInput>
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Create Subscription"
        description="Configure customer details, plan selection, and line items."
        schema={subscriptionFormSchema}
        defaultValues={{
          templateId: "",
          customerId: customers && customers.length > 0 ? customers[0].id : "",
          planId: plansData && plansData.data.length > 0 ? plansData.data[0].id : "",
          startDate: new Date().toISOString().split("T")[0],
          expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
          paymentTerms: "Net 30",
          lines: [
            {
              productId: productsData && productsData.data.length > 0 ? productsData.data[0].id : "",
              variantId: "",
              quantity: 1,
              taxIds: taxes && taxes.length > 0 ? [taxes[0].id] : [],
            },
          ],
        }}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Create Subscription"
      >
        {(form) => (
          <SubscriptionFormFields
            register={form.register}
            control={form.control}
            watch={form.watch}
            setValue={form.setValue}
            errors={form.formState.errors}
            customers={customers}
            plans={plansData?.data}
            products={productsData?.data}
            taxes={taxes}
            templates={templates}
          />
        )}
      </FormDialog>
    </div>
  );
};


import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";

interface PlaceholderProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto font-bold text-lg">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {title} Module Ready
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Phase 1 scaffolding complete. Navigation, auth routing, layout, and role
          guards verified for {title}.
        </p>
      </div>
    </div>
  );
};

export const DashboardPlaceholder = () => (
  <PlaceholderPage
    title="Finance Dashboard"
    description="Recurring revenue overview, subscriptions summary, and overdue invoices."
  />
);

export const SubscriptionsPlaceholder = () => (
  <PlaceholderPage
    title="Subscriptions"
    description="Track quote-to-active subscription lifecycles, plans and recurring renewals."
  />
);

export const InvoicesPlaceholder = () => (
  <PlaceholderPage
    title="Invoices & Billing"
    description="Automated billing day invoices, tax computations, and payment matching."
  />
);

export const PaymentsPlaceholder = () => (
  <PlaceholderPage
    title="Payments"
    description="Record invoice settlements, payment methods, and reconcile balances."
  />
);

export const CustomersPlaceholder = () => (
  <PlaceholderPage
    title="Customers Directory"
    description="Customer accounts, subscription history, and billing records."
  />
);

export const ProductsPlaceholder = () => (
  <PlaceholderPage
    title="Products & Variants"
    description="Manage products, cost and sales pricing, and brand variants."
  />
);

export const PlansPlaceholder = () => (
  <PlaceholderPage
    title="Subscription Plans"
    description="Billing frequencies (daily/weekly/monthly/yearly) and lifecycle policies."
  />
);

export const DiscountsPlaceholder = () => (
  <PlaceholderPage
    title="Discount Rules"
    description="Volume and percentage promotions, threshold limits, and active periods."
  />
);

export const TaxesPlaceholder = () => (
  <PlaceholderPage
    title="Tax Rules"
    description="Automated percentage tax rates applied on invoice line items."
  />
);

export const StaffPlaceholder = () => (
  <PlaceholderPage
    title="Staff Members"
    description="Internal team user accounts and system permissions."
  />
);

export const PortalPlaceholder = () => (
  <PlaceholderPage
    title="Customer Self-Service Portal"
    description="Manage your active subscriptions, view billing history, and download invoices."
  />
);


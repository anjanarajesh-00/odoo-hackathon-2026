export type Role = "admin" | "staff" | "customer";

export type SubscriptionStatus =
  | "draft"
  | "quotation"
  | "confirmed"
  | "active"
  | "closed";

export type InvoiceStatus =
  | "draft"
  | "confirmed"
  | "paid"
  | "cancelled";

export type PlanState = "open" | "paused" | "closed";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "upi"
  | "cheque";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Credit / Debit Card",
  bank_transfer: "Bank Transfer",
  upi: "UPI / Net Banking",
  cheque: "Cheque / Demand Draft",
};

export type DisplayStatus =
  | SubscriptionStatus
  | InvoiceStatus
  | PlanState
  | "overdue";

export interface StatusStyle {
  bg: string;
  text: string;
  border?: string;
  label: string;
}

export const STATUS_COLORS: Record<DisplayStatus, StatusStyle> = {
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    label: "Draft",
  },
  quotation: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
    label: "Quotation",
  },
  confirmed: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    label: "Confirmed",
  },
  active: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    label: "Active",
  },
  open: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    label: "Open",
  },
  paused: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
    label: "Paused",
  },
  paid: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    label: "Paid",
  },
  closed: {
    bg: "bg-slate-200",
    text: "text-slate-800",
    border: "border-slate-400",
    label: "Closed",
  },
  cancelled: {
    bg: "bg-zinc-100",
    text: "text-zinc-500",
    border: "border-zinc-300",
    label: "Cancelled",
  },
  overdue: {
    bg: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-300",
    label: "Overdue",
  },
};

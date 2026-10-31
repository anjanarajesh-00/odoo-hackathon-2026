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
  | "overdue"
  | "scheduled"
  | "expired"
  | "exhausted";

export interface StatusStyle {
  dot: string;
  text: string;
  bg: string;
  border?: string;
  label: string;
}

export const STATUS_COLORS: Record<DisplayStatus, StatusStyle> = {
  draft: {
    dot: "#8C8982",
    text: "#575551",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Draft",
  },
  cancelled: {
    dot: "#8C8982",
    text: "#575551",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Cancelled",
  },
  quotation: {
    dot: "#C27803",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Quotation",
  },
  paused: {
    dot: "#C27803",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Paused",
  },
  confirmed: {
    dot: "#1D4ED8",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Confirmed",
  },
  active: {
    dot: "#0A5C52",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Active",
  },
  open: {
    dot: "#0A5C52",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Open",
  },
  paid: {
    dot: "#0A5C52",
    text: "#0A5C52",
    bg: "#EBF3F1",
    border: "#DCDAD4",
    label: "Paid",
  },
  closed: {
    dot: "#141413",
    text: "#575551",
    bg: "#EFECE6",
    border: "#DCDAD4",
    label: "Closed",
  },
  overdue: {
    dot: "#B82E1F",
    text: "#B82E1F",
    bg: "#FCEEEB",
    border: "#F5C6C0",
    label: "Overdue",
  },
  scheduled: {
    dot: "#1D4ED8",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Scheduled",
  },
  expired: {
    dot: "#8C8982",
    text: "#575551",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Expired",
  },
  exhausted: {
    dot: "#C27803",
    text: "#141413",
    bg: "#FFFFFF",
    border: "#DCDAD4",
    label: "Exhausted",
  },
};

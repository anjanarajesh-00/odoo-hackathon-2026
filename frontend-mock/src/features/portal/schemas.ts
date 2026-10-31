export interface PortalSummary {
  activeSubscriptions: number;
  outstandingAmount: number;
  overdueCount: number;
  nextInvoiceDate: string | null;
  nextInvoiceAmount: number;
}


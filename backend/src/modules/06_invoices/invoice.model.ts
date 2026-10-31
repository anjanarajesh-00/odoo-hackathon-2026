import { InvoiceStatus } from '../../common/types/index.js';

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  customer_id: string;
  subscription_id?: string | null;
  period_start: string;
  period_end: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  amount_paid: number;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_amount: number;
  discount_amount: number;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceResponseDto {
  id: string;
  number: string;
  status: InvoiceStatus;
  isOverdue: boolean;
  customer: { id: string; name: string };
  subscription?: { id: string; number: string } | null;
  periodStart: string;
  periodEnd: string;
  invoiceDate: string;
  dueDate: string;
  lines: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxAmount: number;
    discountAmount: number;
    amount: number;
  }[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  balance: number;
  payments: any[];
}

import { PaymentMethod } from '../../common/types/index.js';
import { InvoiceResponseDto } from '../06_invoices/invoice.model.js';

export interface Payment {
  id: string;
  invoice_id: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  note?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentResponseDto {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  note?: string | null;
  createdAt: string;
}

export interface RecordPaymentResultDto {
  payment: PaymentResponseDto;
  invoice: InvoiceResponseDto;
}

export const formatPaymentResponse = (p: Payment): PaymentResponseDto => ({
  id: p.id,
  invoiceId: p.invoice_id,
  method: p.method,
  amount: Number(p.amount),
  date: p.date,
  note: p.note || null,
  createdAt: new Date(p.created_at).toISOString(),
});

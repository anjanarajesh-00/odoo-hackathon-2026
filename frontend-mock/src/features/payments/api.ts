import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Payment, RecordPaymentInput } from "./schemas";
import type { Invoice } from "@/features/invoices/schemas";

export interface PaymentsParams {
  page?: number;
  pageSize?: number;
  invoiceId?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: string;
}

export interface PaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  pageSize: number;
  totalAmount?: number;
}

export interface RecordPaymentResponse {
  data: {
    payment: Payment;
    invoice: Invoice;
  };
}

export function usePayments(params: PaymentsParams) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const res = await apiClient.get<any>("/payments", {
        params,
      });
      const rawData = res.data?.data || [];
      const total = res.data?.total ?? rawData.length;
      const page = res.data?.page ?? 1;
      const pageSize = res.data?.pageSize ?? 20;
      const totalAmount = res.data?.summary?.totalAmount ?? res.data?.totalAmount ?? 0;

      const mapped: Payment[] = rawData.map((p: any) => ({
        id: p.id,
        invoice: p.invoice || {
          id: p.invoiceId || p.invoice_id,
          number: p.invoiceNumber || p.invoice_number || p.invoiceId || "—",
        },
        customer: p.customer || {
          id: p.customerId || p.customer_id || "",
          name: p.customerName || p.customer_name || "Customer",
        },
        method: p.method,
        amount: Number(p.amount || 0),
        date: p.date,
        note: p.note || null,
        createdAt: p.createdAt || p.created_at,
      }));

      return {
        data: mapped,
        total,
        page,
        pageSize,
        totalAmount,
      };
    },
  });
}

export function usePayment(id?: string) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Payment }>(`/payments/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useRecordPayment(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecordPaymentInput) => {
      const res = await apiClient.post<RecordPaymentResponse>(
        `/invoices/${invoiceId}/payments`,
        data
      );
      return res.data.data;
    },
    onSuccess: ({ payment, invoice }) => {
      // Immediate cache updates & invalidations
      queryClient.setQueryData(["invoices", invoice.id], invoice);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(
        `Payment of ₹${payment.amount.toFixed(2)} recorded for ${invoice.number}`
      );
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to record payment";
      toast.error(msg);
    },
  });
}


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
      const res = await apiClient.get<PaymentsResponse>("/payments", {
        params,
      });
      return res.data;
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


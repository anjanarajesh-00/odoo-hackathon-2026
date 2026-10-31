import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Invoice, GenerateInvoicesInput } from "./schemas";

export interface InvoicesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  overdue?: boolean | string;
  customerId?: string;
  subscriptionId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GenerateInvoicesResponse {
  data: {
    created: number;
    skipped: number;
    invoiceIds: string[];
  };
}

export function useInvoices(params: InvoicesParams) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const res = await apiClient.get<InvoicesResponse>("/invoices", {
        params,
      });
      return res.data;
    },
  });
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Invoice }>(`/invoices/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: GenerateInvoicesInput) => {
      const res = await apiClient.post<any>("/invoices/generate", data || {});
      const raw = res.data?.data || res.data;
      return {
        created: raw.created ?? raw.createdCount ?? 0,
        skipped: raw.skipped ?? raw.skippedCount ?? 0,
        invoiceIds: raw.invoiceIds ?? [],
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success(`${result.created} invoices created, ${result.skipped} skipped`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to generate invoices";
      toast.error(msg);
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await apiClient.post<{ data: Invoice }>("/invoices", { subscriptionId });
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(`Invoice "${created.number}" created`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create invoice";
      toast.error(msg);
    },
  });
}

export function useConfirmInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: Invoice }>(`/invoices/${id}/confirm`);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", updated.id] });
      toast.success(`Invoice "${updated.number}" confirmed`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to confirm invoice";
      toast.error(msg);
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: Invoice }>(`/invoices/${id}/cancel`);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", updated.id] });
      toast.success(`Invoice "${updated.number}" cancelled`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to cancel invoice";
      toast.error(msg);
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<any>(`/invoices/${id}/send`);
      return res.data?.data || res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(res?.message || "Invoice sent to customer");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to send invoice";
      toast.error(msg);
    },
  });
}


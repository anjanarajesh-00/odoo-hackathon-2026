import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type {
  Subscription,
  SubscriptionFormInput,
  SubscriptionHistoryItem,
  CustomerLookup,
  TaxLookup,
  QuotationTemplate,
} from "./schemas";
import type { SubscriptionStatus } from "@/types/enums";

export interface SubscriptionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  customerId?: string;
  planId?: string;
  expiringBefore?: string;
  sort?: string;
}

export interface SubscriptionsResponse {
  data: Subscription[];
  total: number;
  page: number;
  pageSize: number;
}

export function useSubscriptions(params: SubscriptionsParams) {
  return useQuery({
    queryKey: ["subscriptions", params],
    queryFn: async () => {
      const res = await apiClient.get<SubscriptionsResponse>("/subscriptions", {
        params,
      });
      return res.data;
    },
  });
}

export function useSubscription(id?: string) {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Subscription }>(`/subscriptions/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useSubscriptionHistory(id?: string) {
  return useQuery({
    queryKey: ["subscriptions", id, "history"],
    queryFn: async (): Promise<SubscriptionHistoryItem[]> => {
      const res = await apiClient.get<any>(
        `/subscriptions/${id}/history`
      );
      const rawList = res.data?.data || [];
      return rawList.map((h: any) => ({
        id: h.id,
        from: h.from || h.fromStatus,
        to: h.to || h.toStatus,
        by: h.by || h.changedBy || "System",
        at: h.at || h.createdAt || new Date().toISOString(),
        note: h.note || h.reason || null,
      }));
    },
    enabled: Boolean(id),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubscriptionFormInput) => {
      const res = await apiClient.post<{ data: Subscription }>("/subscriptions", data);
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(`Subscription "${created.number}" created successfully!`);
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SubscriptionFormInput }) => {
      const res = await apiClient.patch<{ data: Subscription }>(`/subscriptions/${id}`, data);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", updated.id] });
      toast.success(`Subscription "${updated.number}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update subscription";
      toast.error(msg);
    },
  });
}

export function useTransitionSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, to }: { id: string; to: SubscriptionStatus }) => {
      const res = await apiClient.post<{ data: Subscription }>(
        `/subscriptions/${id}/transition`,
        { to }
      );
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", updated.id, "history"] });
      toast.success(`Subscription status changed to "${updated.status}"`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Transition not permitted";
      toast.error(msg);
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: Subscription }>(`/subscriptions/${id}/renew`);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", updated.id, "history"] });
      toast.success(`Subscription "${updated.number}" renewed successfully`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to renew subscription";
      toast.error(msg);
    },
  });
}

// ----------------- Lookups -----------------

export function useCustomersLookup(search?: string) {
  return useQuery({
    queryKey: ["lookups", "customers", search],
    queryFn: async () => {
      const res = await apiClient.get<{ data: CustomerLookup[] }>("/customers", {
        params: { search, pageSize: 50 },
      });
      return res.data.data;
    },
  });
}

export function useTaxes() {
  return useQuery({
    queryKey: ["lookups", "taxes"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TaxLookup[] }>("/taxes");
      return res.data.data;
    },
  });
}

export function useQuotationTemplates() {
  return useQuery({
    queryKey: ["lookups", "quotation-templates"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: QuotationTemplate[] }>("/quotation-templates");
      return res.data.data;
    },
  });
}


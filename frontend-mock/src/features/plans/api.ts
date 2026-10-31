import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Plan, PlanInput } from "./schemas";

export interface PlansParams {
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  billingPeriod?: string;
  sort?: string;
}

export interface PlansResponse {
  data: Plan[];
  total: number;
  page: number;
  pageSize: number;
}

export function usePlans(params: PlansParams) {
  return useQuery({
    queryKey: ["plans", params],
    queryFn: async () => {
      const res = await apiClient.get<PlansResponse>("/plans", {
        params,
      });
      return res.data;
    },
  });
}

export function usePlan(id?: string) {
  return useQuery({
    queryKey: ["plans", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Plan }>(`/plans/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlanInput) => {
      const res = await apiClient.post<{ data: Plan }>("/plans", data);
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(`Plan "${created.name}" created successfully`);
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PlanInput }) => {
      const res = await apiClient.patch<{ data: Plan }>(`/plans/${id}`, data);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(`Plan "${updated.name}" updated successfully`);
    },
  });
}

export function usePlanAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      body,
    }: {
      id: string;
      action: "pause" | "resume" | "close" | "renew";
      body?: Record<string, any>;
    }) => {
      const res = await apiClient.post<{ data: Plan }>(`/plans/${id}/${action}`, body || {});
      return { plan: res.data.data, action };
    },
    onSuccess: ({ plan, action }) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      const verb =
        action === "pause"
          ? "paused"
          : action === "resume"
          ? "resumed"
          : action === "close"
          ? "closed early"
          : "renewed";
      toast.success(`Plan "${plan.name}" was ${verb}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update plan status";
      toast.error(msg);
    },
  });
}


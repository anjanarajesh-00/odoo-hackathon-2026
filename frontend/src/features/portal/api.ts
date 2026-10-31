import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PortalSummary } from "./schemas";
import { useAuthStore } from "@/store/auth.store";

export function usePortalSummary() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["portal", "summary", user?.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PortalSummary }>("/portal/summary");
      return res.data.data;
    },
    staleTime: 30000,
  });
}

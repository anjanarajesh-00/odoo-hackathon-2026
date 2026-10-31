import { useAuthStore } from "@/store/auth.store";

export function useIsCustomer(): boolean {
  const role = useAuthStore((s) => s.role);
  return role === "customer";
}

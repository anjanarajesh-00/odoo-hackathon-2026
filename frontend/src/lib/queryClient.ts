import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
    mutations: {
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred.";
        toast.error(message);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Avoid spamming unauthenticated query toasts, handled by api interceptor
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load data";
        toast.error(message);
      }
    },
  }),
});


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Product, ProductInput } from "./schemas";

export interface ProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  sort?: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export function useProducts(params: ProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await apiClient.get<ProductsResponse>("/products", {
        params,
      });
      return res.data;
    },
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Product }>(`/products/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductInput) => {
      const res = await apiClient.post<{ data: Product }>("/products", data);
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Product "${created.name}" created successfully`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductInput }) => {
      const res = await apiClient.patch<{ data: Product }>(`/products/${id}`, data);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Product "${updated.name}" updated successfully`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name?: string }) => {
      await apiClient.delete(`/products/${id}`);
      return { id, name };
    },
    onSuccess: ({ name }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Product "${name || "item"}" deleted`);
    },
  });
}


import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore, type User } from "@/store/auth.store";
import type {
  LoginInput,
  SignupInput,
  ForgotPasswordInput,
} from "./schemas";

export interface AuthSuccessData {
  token: string;
  user: User;
}

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await apiClient.post<{ data: AuthSuccessData }>("/auth/login", credentials);
      return res.data;
    },
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
    },
  });
}

export function useSignupMutation() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (data: SignupInput) => {
      const res = await apiClient.post<{ data: AuthSuccessData }>("/auth/signup", {
        name: data.name,
        email: data.email,
        company: data.company,
        password: data.password,
      });
      return res.data;
    },
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const res = await apiClient.post<{ message: string }>("/auth/forgot-password", data);
      return res.data;
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await apiClient.post<{ message: string }>("/auth/reset-password", data);
      return res.data;
    },
  });
}

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: User }>("/auth/me");
        updateUser(res.data.data);
        return res.data.data;
      } catch (err) {
        logout();
        throw err;
      }
    },
    enabled: Boolean(token),
    retry: false,
  });
}

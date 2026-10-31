import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "@/lib/queryClient";
import type { Role } from "@/types/enums";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  customerId?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      login: (token, user) => {
        set({
          token,
          user,
          role: user.role,
          isAuthenticated: true,
        });
      },
      logout: () => {
        queryClient.clear();
        set({
          token: null,
          user: null,
          role: null,
          isAuthenticated: false,
        });
      },
      updateUser: (user) => {
        set({
          user,
          role: user.role,
        });
      },
    }),
    {
      name: "brightloop-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


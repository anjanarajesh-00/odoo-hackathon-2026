import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/enums";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const role = useAuthStore((s) => s.role);

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};


import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { RoleGuard } from "./guards/RoleGuard";
import { AppLayout } from "./AppLayout";
import { ForbiddenPage, NotFoundPage } from "./ErrorPages";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { PlansPage } from "@/features/plans/pages/PlansPage";
import {
  DashboardPlaceholder,
  SubscriptionsPlaceholder,
  InvoicesPlaceholder,
  PaymentsPlaceholder,
  CustomersPlaceholder,
  DiscountsPlaceholder,
  TaxesPlaceholder,
  StaffPlaceholder,
  PortalPlaceholder,
} from "./PlaceholderPages";
import { useAuthStore } from "@/store/auth.store";

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  if (role === "staff") return <Navigate to="/subscriptions" replace />;
  return <Navigate to="/portal" replace />;
};

export const router = createBrowserRouter([
  // Public auth routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },

  // Protected app layout
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        path: "dashboard",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <DashboardPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <RoleGuard allowedRoles={["admin", "staff", "customer"]}>
            <SubscriptionsPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "subscriptions/:id",
        element: (
          <RoleGuard allowedRoles={["admin", "staff", "customer"]}>
            <SubscriptionsPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "invoices",
        element: (
          <RoleGuard allowedRoles={["admin", "staff", "customer"]}>
            <InvoicesPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "invoices/:id",
        element: (
          <RoleGuard allowedRoles={["admin", "staff", "customer"]}>
            <InvoicesPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "payments",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <PaymentsPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "customers",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <CustomersPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "products",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <ProductsPage />
          </RoleGuard>
        ),
      },
      {
        path: "plans",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <PlansPage />
          </RoleGuard>
        ),
      },
      {
        path: "discounts",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <DiscountsPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "taxes",
        element: (
          <RoleGuard allowedRoles={["admin", "staff"]}>
            <TaxesPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "staff",
        element: (
          <RoleGuard allowedRoles={["admin"]}>
            <StaffPlaceholder />
          </RoleGuard>
        ),
      },
      {
        path: "portal",
        element: (
          <RoleGuard allowedRoles={["customer"]}>
            <PortalPlaceholder />
          </RoleGuard>
        ),
      },
    ],
  },

  // Error pages
  {
    path: "/403",
    element: <ForbiddenPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

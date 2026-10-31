import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const ForbiddenPage: React.FC = () => {
  const role = useAuthStore((s) => s.role);

  const getHomePath = () => {
    switch (role) {
      case "admin":
        return "/dashboard";
      case "staff":
        return "/subscriptions";
      case "customer":
        return "/portal";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4 p-8 bg-card border rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          403 - Access Denied
        </h1>
        <p className="text-muted-foreground text-sm">
          You do not have permission to view this page with your current role ({role || "unassigned"}).
        </p>
        <div className="pt-2">
          <Link
            to={getHomePath()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4 p-8 bg-card border rounded-xl shadow-sm">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};


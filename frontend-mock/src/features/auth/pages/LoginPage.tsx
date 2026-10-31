import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas";
import { useLoginMutation } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [genericError, setGenericError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setGenericError(null);
    try {
      const res = await loginMutation.mutateAsync(data);
      toast.success(`Welcome back, ${res.data.user.name}!`);

      // Redirect to originally intended location or by role
      const intended = (location.state as any)?.from?.pathname;
      if (intended && !intended.startsWith("/login")) {
        navigate(intended, { replace: true });
        return;
      }

      const userRole = res.data.user.role;
      if (userRole === "admin") navigate("/dashboard", { replace: true });
      else if (userRole === "staff") navigate("/subscriptions", { replace: true });
      else navigate("/portal", { replace: true });
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        setGenericError("Invalid email or password");
      }
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "Test@1234!", { shouldValidate: true });
    setGenericError(null);
  };

  const isMocking = import.meta.env.VITE_USE_MOCKS === "true";

  return (
    <AuthLayout
      title="Sign in to Brightloop"
      subtitle="Manage plans, recurring billing & subscriptions"
    >
      {/* 401 Inline Error Notice */}
      {genericError && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{genericError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold text-foreground"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-foreground"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className="w-full pl-3 pr-10 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
        >
          {loginMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Quick Logins (Mock mode only) */}
      {isMocking && (
        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-[11px] text-center font-medium text-muted-foreground uppercase tracking-wider">
            Demo Credentials (Password: Test@1234!)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@test.com")}
              className="px-2 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("staff@test.com")}
              className="px-2 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("customer@test.com")}
              className="px-2 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
            >
              Customer
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <p className="text-center text-xs text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-primary font-semibold hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

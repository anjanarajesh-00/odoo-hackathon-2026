import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas";
import { useResetPasswordMutation } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordRules } from "../components/PasswordRules";
import { Eye, EyeOff, Loader2, ArrowRight, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const resetMutation = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");

  // Missing token state
  if (!token) {
    return (
      <AuthLayout
        title="Invalid Reset Request"
        subtitle="The password reset link is invalid or incomplete"
      >
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-amber-950">
              Reset Token Missing
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              No reset token was provided in the URL. Please request a new
              password reset link.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:underline"
            >
              <span>Request new reset link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setTokenError(null);
    try {
      await resetMutation.mutateAsync({
        token,
        password: data.password,
      });
      toast.success("Password updated successfully! Please sign in.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "The password reset token is invalid or has expired.";
      setTokenError(msg);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter a strong new password for your Brightloop account"
    >
      {/* Inline Token Error */}
      {tokenError && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Reset Failed</span>
          </div>
          <p>{tokenError}</p>
          <div className="pt-1">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1 font-semibold text-rose-900 hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Request a new link</span>
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="reset-password"
            className="text-xs font-semibold text-foreground"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className="w-full pl-3 pr-10 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="Enter new password"
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

        {/* Live Password Rules Checklist */}
        <PasswordRules password={passwordValue} />

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="reset-confirm-password"
            className="text-xs font-semibold text-foreground"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full pl-3 pr-10 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="Re-type new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
        >
          {resetMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Save & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          <Link
            to="/login"
            className="text-primary hover:underline font-semibold"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

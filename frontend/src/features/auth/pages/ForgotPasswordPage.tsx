import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas";
import { useForgotPasswordMutation } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { MailCheck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const forgotMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotMutation.mutateAsync(data);
      setSubmitted(true);
      toast.success("Password reset request received.");
    } catch {
      // Still show the generic success message to prevent user enumeration
      setSubmitted(true);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you an email with password recovery instructions"
    >
      {submitted ? (
        <div className="p-6 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <MailCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-emerald-950">
              Check your email
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              If that email is registered, a reset link has been sent. Please check
              your inbox and spam folder.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="text-xs font-semibold text-foreground"
            >
              Email Address
            </label>
            <input
              id="forgot-email"
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

          <button
            type="submit"
            disabled={forgotMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {forgotMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

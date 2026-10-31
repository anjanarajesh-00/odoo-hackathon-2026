import React from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { X, Loader2 } from "lucide-react";

interface FormDialogProps<TFormData extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: ZodSchema<TFormData>;
  defaultValues?: DefaultValues<TFormData>;
  onSubmit: (data: TFormData, form: UseFormReturn<TFormData>) => Promise<void> | void;
  isLoading?: boolean;
  children: (form: UseFormReturn<TFormData>) => React.ReactNode;
  submitLabel?: string;
}

export function FormDialog<TFormData extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  isLoading = false,
  children,
  submitLabel = "Save Changes",
}: FormDialogProps<TFormData>) {
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  if (!open) return null;

  const handleSubmit = async (data: TFormData) => {
    try {
      await onSubmit(data, form);
    } catch (err: any) {
      // Map server field errors if available
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          form.setError(field as any, {
            type: "server",
            message: String(msg),
          });
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {children(form)}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


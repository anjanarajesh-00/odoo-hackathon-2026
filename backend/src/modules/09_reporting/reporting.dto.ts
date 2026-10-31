import { z } from 'zod';

export const dashboardSummaryQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const revenueTrendQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
});

export const overdueInvoicesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type DashboardSummaryQueryDto = z.infer<typeof dashboardSummaryQuerySchema>;
export type RevenueTrendQueryDto = z.infer<typeof revenueTrendQuerySchema>;
export type OverdueInvoicesQueryDto = z.infer<typeof overdueInvoicesQuerySchema>;

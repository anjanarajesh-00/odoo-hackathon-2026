# Backend Issues & Feedback for Co-Dev

The following table tracks the resolution of issues discovered during integration:

### Resolved Issues (Fixed in Backend on branch `integration`)

1. **[RESOLVED in commit `9a7096e`] Missing route `POST /api/v1/invoices/:id/send`**
   - **Resolution:** Registered `router.post('/:id/send', authorize('admin', 'staff'), ...)` in `invoice.routes.ts` and added status validation in `invoice.service.ts` to return 409 Conflict if attempting to dispatch a draft invoice.
2. **[RESOLVED in commit `15b170a`] `GET /api/v1/payments` Missing Joined Relations & Search**
   - **Resolution:** Added SQL joins to `invoices` and `customers` in `payment.repository.ts`, returning nested `invoice: { id, number }` and `customer: { id, name }`, supported `search` by invoice number or customer name, and added aggregate `"summary": { count, totalAmount }`.
3. **[RESOLVED in commit `981864b`] Missing endpoint `GET /api/v1/portal/summary`**
   - **Resolution:** Created `backend/src/modules/10_portal/` and mounted `portalRouter` at `/api/v1/portal`. Scoped strictly to `customer` role (returns 403 for admin/staff); returns active subscriptions count, outstanding confirmed balance, overdue count, and nearest next billing cycle date and amount.
4. **[RESOLVED in commit `3589251`] Discount `used_count` Never Increments**
   - **Resolution:** Atomic increment of `used_count` within the database transaction inside `invoiceRepository.create()` when a discount is applied; skips discounts where `used_count >= usage_limit`, and ensures idempotent re-runs don't increment.

---

### Handled Cleanly by Frontend Mappers (No Backend Code Changes Needed)

5. **Discounts and Taxes list endpoints are unpaginated:** `GET /api/v1/discounts` and `GET /api/v1/taxes` return `{ data: T[] }`. The frontend API layer wraps them into standard pagination envelopes for `DataTable`.
6. **Invoice generation response key naming:** `POST /api/v1/invoices/generate` returns `{ data: { createdCount, skippedCount, invoiceIds } }`. Frontend mapper accepts either `created` or `createdCount`.
7. **Subscription status breakdown shape difference:** `GET /api/v1/dashboard/subscriptions-by-status` returns an object map `{ draft: n, quotation: n, ... }`. Dashboard mapper transforms it into the chart-ready array `[{ status, count }]`.
8. **Subscription history field name differences:** `GET /api/v1/subscriptions/:id/history` returns `{ fromStatus, toStatus, changedBy, reason, createdAt }`. Frontend mapper maps them to `{ from, to, by, at, note }`.
9. **Password reset response envelope:** `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` return `{ message: string }`. Frontend client normalizes non-data responses.

# Brightloop Contract v0.1 — Full API Audit

This document is the contract audit between the running backend (`http://localhost:5000/api/v1`) and the frontend application.

---

## 1. Global Specifications

| Property | Backend Implementation | Frontend Expectation | Difference / Adaptation |
|---|---|---|---|
| **Base Path** | `/api/v1` | `/api/v1` or `/api` via Vite proxy | Set `VITE_API_URL=http://localhost:5000/api/v1` |
| **Response Envelope (Single)** | `{ data: T }` | `{ data: T }` | Matched 1:1 |
| **Response Envelope (List)** | `{ data: T[], total, page, pageSize }` | `{ data: T[], total, page, pageSize }` | Matched 1:1 (except Taxes and Discounts which return unpaginated `{ data: T[] }`) |
| **Error Format** | `{ message: string, errors?: Record<string, string> }` | `{ message: string, errors?: Record<string, string> }` | Matched 1:1; 422 maps field-level errors, 409 conflict |
| **Authentication Header** | `Authorization: Bearer <jwt>` | `Authorization: Bearer <token>` | Matched 1:1 |
| **CORS Configuration** | `origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']`, `credentials: true` | Frontend running on `http://localhost:5173` | Matched 1:1 |
| **Casing** | JSON fields are camelCase; database columns are snake_case | Frontend uses camelCase throughout | Matched 1:1 |
| **Money Representation** | Formatted as `number` (float with 2 decimal precision) | Number | Matched 1:1 |
| **Dates** | `YYYY-MM-DD` for business dates; ISO 8601 for timestamps | `YYYY-MM-DD` and ISO strings | Matched 1:1 |

---

## 2. Comprehensive Endpoint Matrix

| Method | Endpoint | Allowed Roles | Request Payload / Params | Response Format | Contract Differences & Frontend Handling |
|---|---|---|---|---|---|
| `POST` | `/auth/login` | Public | `{ email, password }` | `{ data: { token, user: { id, name, email, role, customerId?, isActive, createdAt? } } }` | Matched. Customer token automatically includes `customerId`. |
| `POST` | `/auth/signup` | Public | `{ name, email, password, company?, phone? }` | `{ data: { token, user: { id, name, email, role: 'customer', customerId } } }` (201) | Matched. Automatically provisions customer entity. |
| `GET` | `/auth/me` | Authenticated | None | `{ data: UserResponseDto }` | Matched. |
| `POST` | `/auth/forgot-password` | Public | `{ email }` | `{ message: string }` | Backend returns top-level `{ message }` instead of `{ data }`. Adapted in auth api. |
| `POST` | `/auth/reset-password` | Public | `{ token, password }` | `{ message: string }` | Backend returns top-level `{ message }` instead of `{ data }`. Adapted in auth api. |
| `POST` | `/auth/logout` | Public | None | `{ message: string }` | Matched. |
| `GET` | `/users` | `admin` | `?role=staff&page=1&pageSize=20&search=` | `{ data: UserResponseDto[], total, page, pageSize }` | Matched. |
| `POST` | `/users/staff` | `admin` | `{ name, email, password }` | `{ data: UserResponseDto }` (201) | Matched. Validates strong password, returns 409 on duplicate email. |
| `PATCH` | `/users/:id` | `admin` | `{ name?, active? }` | `{ data: UserResponseDto }` | Matched. |
| `DELETE` | `/users/:id` | `admin` | None | `{ data: UserResponseDto }` | Deactivates user (`is_active = false`). Matched. |
| `GET` | `/customers` | `admin`, `staff` | `?page=1&pageSize=20&search=` | `{ data: CustomerResponseDto[], total, page, pageSize }` | Matched. |
| `POST` | `/customers` | `admin`, `staff` | `{ name, email, company?, phone?, address? }` | `{ data: CustomerResponseDto }` (201) | Matched. |
| `GET` | `/customers/:id` | `admin`, `staff` | None | `{ data: CustomerResponseDto }` | Matched. |
| `PATCH` | `/customers/:id` | `admin`, `staff` | `{ name?, email?, company?, phone?, address? }` | `{ data: CustomerResponseDto }` | Matched. |
| `GET` | `/products` | `admin`, `staff` | `?page=1&pageSize=20&search=&type=` | `{ data: ProductResponseDto[], total, page, pageSize }` | Matched. |
| `POST` | `/products` | `admin` | `{ name, type, salesPrice, costPrice, notes?, variants? }` | `{ data: ProductResponseDto }` (201) | Matched. |
| `GET` | `/products/:id` | `admin`, `staff` | None | `{ data: ProductResponseDto }` | Matched. |
| `PATCH` | `/products/:id` | `admin` | `{ name?, type?, salesPrice?, costPrice?, notes?, variants? }` | `{ data: ProductResponseDto }` | Matched. Replaces variant array. |
| `DELETE` | `/products/:id` | `admin` | None | `{ message: string }` | Matched. |
| `GET` | `/plans` | `admin`, `staff` | `?page=1&pageSize=20&search=&state=&billingPeriod=` | `{ data: PlanResponseDto[], total, page, pageSize }` | Matched. |
| `POST` | `/plans` | `admin` | `{ name, price, billingPeriod, minQuantity, availableFrom, availableTo?, autoClose, allowEarlyClose, allowPause, allowRenew, state }` | `{ data: PlanResponseDto }` (201) | Matched. |
| `GET` | `/plans/:id` | `admin`, `staff` | None | `{ data: PlanResponseDto }` | Matched. |
| `PATCH` | `/plans/:id` | `admin` | Partial plan object | `{ data: PlanResponseDto }` | Matched. |
| `POST` | `/plans/:id/pause` | `admin` | None | `{ data: PlanResponseDto }` | Matched. |
| `POST` | `/plans/:id/resume` | `admin` | None | `{ data: PlanResponseDto }` | Matched. |
| `POST` | `/plans/:id/close` | `admin` | None | `{ data: PlanResponseDto }` | Matched. |
| `POST` | `/plans/:id/renew` | `admin` | `{ availableTo?: string }` | `{ data: PlanResponseDto }` | Matched. |
| `GET` | `/quotation-templates` | `admin`, `staff` | None | `{ data: QuotationTemplateResponseDto[] }` | Matched. |
| `GET` | `/taxes` | `admin`, `staff` | None | `{ data: TaxResponseDto[] }` | Unpaginated list inside `{ data }`. Adapted in taxes api. |
| `POST` | `/taxes` | `admin` | `{ name, rate, active? }` | `{ data: TaxResponseDto }` (201) | Matched. |
| `PATCH` | `/taxes/:id` | `admin` | `{ name?, rate?, active? }` | `{ data: TaxResponseDto }` | Matched. |
| `DELETE` | `/taxes/:id` | `admin` | None | `{ message: string }` | Matched. Returns 409 Conflict with explanation if tax is used in existing lines. |
| `GET` | `/discounts` | `admin`, `staff` | `?active=&search=` | `{ data: DiscountResponseDto[] }` | Unpaginated list inside `{ data }`. Adapted in discounts api. |
| `POST` | `/discounts` | `admin` | `{ name, type, value, minPurchase?, minQuantity?, startDate, endDate, usageLimit, appliesTo, productIds?, subscriptionIds? }` | `{ data: DiscountResponseDto }` (201) | Matched. |
| `PATCH` | `/discounts/:id` | `admin` | Partial discount object | `{ data: DiscountResponseDto }` | Matched. |
| `DELETE` | `/discounts/:id` | `admin` | None | `{ message: string }` | Matched. |
| `GET` | `/subscriptions` | `admin`, `staff` (all), `customer` (own) | `?page=1&pageSize=20&search=&status=&customerId=&planId=&expiringBefore=` | `{ data: SubscriptionResponseDto[], total, page, pageSize }` | Matched. |
| `POST` | `/subscriptions` | `admin`, `staff` | `{ customerId, planId, templateId?, startDate, expiryDate?, paymentTerms, lines }` | `{ data: SubscriptionResponseDto }` (201) | Matched. |
| `GET` | `/subscriptions/:id` | `admin`, `staff`, owning `customer` | None | `{ data: SubscriptionResponseDto }` | Returns 404 for customers requesting other tenant subscriptions. Mapper extracts `customerId` from `customer.id`. |
| `PATCH` | `/subscriptions/:id` | `admin`, `staff` | `{ planId?, startDate?, expiryDate?, paymentTerms?, lines? }` | `{ data: SubscriptionResponseDto }` | Allowed only while `status` is `draft` or `quotation`. |
| `POST` | `/subscriptions/:id/transition` | `admin`, `staff` | `{ to, reason? }` | `{ data: SubscriptionResponseDto }` | Matched. |
| `POST` | `/subscriptions/:id/renew` | `admin`, `staff` | `{ expiryDate? }` | `{ data: SubscriptionResponseDto }` | Matched. |
| `GET` | `/subscriptions/:id/history` | `admin`, `staff` | None | `{ data: [{ id, fromStatus, toStatus, changedBy, reason, createdAt }] }` | Field names differ slightly (`fromStatus` vs `from`, `toStatus` vs `to`, `changedBy` vs `by`, `createdAt` vs `at`). Normalized in subscriptions mapper. |
| `GET` | `/invoices` | `admin`, `staff` (all), `customer` (own) | `?page=1&pageSize=20&search=&status=&overdue=&customerId=&subscriptionId=&dateFrom=&dateTo=` | `{ data: InvoiceResponseDto[], total, page, pageSize }` | Matched. For customers, draft invoices are hidden. |
| `POST` | `/invoices` | `admin`, `staff` | `{ subscriptionId, periodStart?, periodEnd? }` | `{ data: InvoiceResponseDto }` (201) | Matched. |
| `POST` | `/invoices/generate` | `admin`, `staff` | `{ asOfDate? }` | `{ data: { createdCount, skippedCount, invoiceIds } }` | Backend returns `createdCount`/`skippedCount`; frontend expected `created`/`skipped`. Normalized in invoices api mapper. |
| `GET` | `/invoices/:id` | `admin`, `staff`, owning `customer` | None | `{ data: InvoiceResponseDto }` | Matched. |
| `POST` | `/invoices/:id/confirm` | `admin`, `staff` | None | `{ data: InvoiceResponseDto }` | Matched. |
| `POST` | `/invoices/:id/cancel` | `admin`, `staff` | None | `{ data: InvoiceResponseDto }` | Matched. Blocked if payments exist. |
| `POST` | `/invoices/:id/send` | `admin`, `staff` | None | - | **Route missing in `invoice.routes.ts`** (controller has `send()` method). Listed in BACKEND_ISSUES.md. |
| `GET` | `/invoices/:id/pdf` | `admin`, `staff`, owning `customer` | None | Raw HTML template | Matched. Frontend uses clean print sheet via `window.print()`. |
| `POST` | `/invoices/:id/payments` | `admin`, `staff` | `{ method, amount, date, note? }` | `{ data: { payment: PaymentResponseDto, invoice: InvoiceResponseDto } }` | Matched. Returns updated invoice with `amountPaid`, `balance`, and updated `status`. |
| `GET` | `/payments` | `admin`, `staff` (all), `customer` (own) | `?page=1&pageSize=20&invoiceId=&method=&dateFrom=&dateTo=` | `{ data: PaymentResponseDto[], total, page, pageSize }` | Row objects return `invoiceId` but lack nested `invoice: { id, number }` and `customer: { id, name }`. Normalized safely with fallbacks in payments api mapper. |
| `GET` | `/payments/:id` | `admin`, `staff` | None | `{ data: PaymentResponseDto }` | Matched. |
| `GET` | `/dashboard/summary` | `admin`, `staff` | `?dateFrom=&dateTo=` | `{ data: { activeSubscriptions, mrr, revenueCollected, outstandingAmount, overdueCount, overdueAmount, paidInvoices, unpaidInvoices } }` | Exact 1:1 match. |
| `GET` | `/dashboard/revenue-trend` | `admin`, `staff` | `?groupBy=day\|week\|month&dateFrom=&dateTo=` | `{ data: [{ period, revenue }] }` | Exact 1:1 match. |
| `GET` | `/dashboard/subscriptions-by-status` | `admin`, `staff` | None | `{ data: { draft: n, quotation: n, confirmed: n, active: n, closed: n } }` | Backend returns a dictionary/map; frontend expected array `[{ status, count }]`. Normalized in dashboard api mapper. |
| `GET` | `/dashboard/overdue-invoices` | `admin`, `staff` | `?page=1&pageSize=20&search=` | `{ data: InvoiceResponseDto[], total, page, pageSize }` | Matched. |
| `GET` | `/dashboard/insights` | `admin`, `staff` | None | `{ data: { forecast, atRiskInvoices, quickRatios } }` | Available on backend as an advanced reporting endpoint. |
| `GET` | `/portal/summary` | `customer` | None | - | **Route missing in backend** (no `/portal` router mounted). Frontend falls back to computing metrics from customer's own active subscriptions and invoices. Listed in BACKEND_ISSUES.md. |


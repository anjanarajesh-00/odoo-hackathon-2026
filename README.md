# Brightloop Subscription Management System - Backend

Production-grade modular backend built with **Node.js, Express, TypeScript, Knex.js, Supabase PostgreSQL, and MySQL**.

Engineered to strictly implement the **[Frontend ↔ Backend API Contract v0.1]** with full multi-database switching capabilities.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: v20+ or v24+
- **Database**: Either local **MySQL** (e.g. XAMPP, MySQL Workbench) OR cloud **Supabase PostgreSQL**

### Installation
```bash
cd subscription-backend
npm install
```

### Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

## 2. Multi-Database Support & Switching

The backend supports zero-code database switching via `DATABASE_TYPE` in `.env`:

### A. To run with Local MySQL:
1. Start your local MySQL server.
2. Create the database:
   ```sql
   CREATE DATABASE brightloop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. In `.env`:
   ```env
   DATABASE_TYPE=mysql
   MYSQL_DB_HOST=127.0.0.1
   MYSQL_DB_PORT=3306
   MYSQL_DB_NAME=brightloop_db
   MYSQL_DB_USER=root
   MYSQL_DB_PASSWORD=your_mysql_password
   ```

### B. To run with Cloud Supabase PostgreSQL:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** ➔ **Database** ➔ **Connection String**.
3. In `.env`:
   ```env
   DATABASE_TYPE=supabase
   SUPABASE_DB_HOST=aws-0-ap-south-1.pooler.supabase.com
   SUPABASE_DB_PORT=5432
   SUPABASE_DB_NAME=postgres
   SUPABASE_DB_USER=postgres.your_project_ref
   SUPABASE_DB_PASSWORD=your_supabase_password
   SUPABASE_DB_SSL=true

   SUPABASE_URL=https://your_project_ref.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### Test Connection:
Run the diagnostic test at any time:
```bash
npm run db:test
```

### Run Migrations & High-Volume Seed:
```bash
# Create all 12 tables
npm run migrate

# Populate test data (1 admin, 2 staff, 20 customers, 5 products, 6 plans, 320 subscriptions, 520 invoices, payments)
npm run seed
```

### Start Development Server:
```bash
npm run dev
```
The server starts at `http://localhost:5000`.

---

## 3. Demo Credentials (from Seed)

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.com` | `Str0ng!Pass1` | Full administrative control |
| **Staff** | `sarah@brightloop.com` | `Str0ng!Pass1` | Sales & day-to-day operations |
| **Staff** | `alex@brightloop.com` | `Str0ng!Pass1` | Account management |
| **Customer** | `customer1@shop.com` | `Str0ng!Pass1` | Customer self-service portal |

---

## 4. API Contract v0.1 Endpoint Summary

All routes are mounted at `/api/v1` with JSON `camelCase` response envelopes and CORS configured for `http://localhost:5173`.

### 1. Auth (`/api/v1/auth`)
- `POST /signup`: Customer self-registration (`{ name, email, password, company, phone }`)
- `POST /login`: Authenticate and receive Bearer JWT (`{ email, password }`)
- `GET /me`: Authenticated user profile and linked `customerId`
- `POST /forgot-password`: Generates reset token (logged to console in dev)
- `POST /reset-password`: Resets password using token
- `POST /logout`: Invalidate session

### 2. Users & Staff (`/api/v1/users`)
- `GET /`: List users (`admin` only)
- `POST /staff`: Create a new staff member (`admin` only)
- `PATCH /:id`: Update user details (`admin` only)
- `DELETE /:id`: Deactivate account (`admin` only)

### 3. Customers (`/api/v1/customers`)
- `GET /`: List customers (`admin`, `staff`)
- `POST /`: Create offline customer (`admin`, `staff`)
- `GET /:id`: Customer detail (`admin`, `staff`)
- `PATCH /:id`: Update customer info (`admin`, `staff`)

### 4. Products & Variants (`/api/v1/products`)
- `GET /`: List products with variants (`admin`, `staff`)
- `POST /`: Create product with variants array (`admin`)
- `GET /:id`: Product detail with variants (`admin`, `staff`)
- `PATCH /:id`: Update product and replace variants (`admin`)
- `DELETE /:id`: Delete product (`admin`)

### 5. Plans (`/api/v1/plans`)
- `GET /`: List plans with state & billingPeriod filters (`admin`, `staff`)
- `POST /`: Create plan with frequencies and closing policies (`admin`)
- `GET /:id`: Plan detail (`admin`, `staff`)
- `PATCH /:id`: Update plan terms (`admin`)
- `POST /:id/pause`: Pause plan (`admin`)
- `POST /:id/resume`: Resume paused plan (`admin`)
- `POST /:id/close`: Close plan early (`admin`)
- `POST /:id/renew`: Reopen / extend plan availability (`admin`)

### 6. Quotation Templates (`/api/v1/quotation-templates`)
- `GET /`: List quotation templates (`admin`, `staff`)
- `POST /`: Create pre-configured sales quote template (`admin`)
- `GET /:id`: Template detail (`admin`, `staff`)
- `PATCH /:id`: Update template (`admin`)
- `DELETE /:id`: Delete template (`admin`)

### 7. Taxes (`/api/v1/taxes`)
- `GET /`: List tax rules (`admin`, `staff`)
- `POST /`: Create tax rule (`admin`)
- `PATCH /:id`: Update tax rule (`admin`)
- `DELETE /:id`: Deactivate tax rule (`admin`)

### 8. Discounts (`/api/v1/discounts`)
- `GET /`: List discount rules (`admin`, `staff`)
- `POST /`: Create percentage or fixed discount rule (`admin` only)
- `PATCH /:id`: Update discount rule (`admin`)
- `DELETE /:id`: Deactivate discount rule (`admin`)

### 9. Subscriptions (`/api/v1/subscriptions`)
- `GET /`: List subscriptions (Staff: all; Customer: own only)
- `POST /`: Create subscription from scratch or template (`admin`, `staff`)
- `GET /:id`: Subscription details with line items (Staff: all; Customer: own only)
- `PATCH /:id`: Edit while in `draft` or `quotation` (`admin`, `staff`)
- `POST /:id/transition`: Transition status (`draft` → `quotation` → `confirmed` → `active` → `closed`)
- `POST /:id/renew`: Renew active subscription (`admin`, `staff`)
- `GET /:id/history`: Status transition log (`admin`, `staff`)

### 10. Invoices (`/api/v1/invoices`)
- `GET /`: List invoices with status & overdue filters (Staff: all; Customer: own only)
- `GET /:id`: Invoice detail with lines and payments (Staff: all; Customer: own only)
- `POST /`: Manual invoice for one subscription (`admin`, `staff`)
- `POST /generate`: Billing day engine — idempotent bulk invoice creation (`admin`, `staff`)
- `POST /:id/confirm`: Confirm draft invoice (`admin`, `staff`)
- `POST /:id/cancel`: Cancel unpaid invoice (`admin`, `staff`)
- `POST /:id/send`: Email invoice to customer (`admin`, `staff`)
- `GET /:id/pdf`: View / download printable invoice (Staff: all; Customer: own only)
- `POST /:id/payments`: Record payment against invoice (`admin`, `staff`)

### 11. Payments (`/api/v1/payments`)
- `GET /`: List recorded payments (Staff: all; Customer: own only)
- `GET /:id`: Payment detail (`admin`, `staff`)

### 12. Dashboard & Analytics (`/api/v1/dashboard`)
- `GET /summary`: Fast aggregate metrics: active subscriptions, MRR, revenue collected, outstanding, overdue count/amount, paid/unpaid invoices (`admin`, `staff`)
- `GET /revenue-trend`: Revenue trend grouped by day/week/month (`admin`, `staff`)
- `GET /subscriptions-by-status`: Real-time subscription counts by status (`admin`, `staff`)
- `GET /overdue-invoices`: Paginated overdue invoices for collections chasing (`admin`, `staff`)

---

## 5. Architecture & Code Structure

```
subscription-backend/
├── src/
│   ├── config/               # Zod env validation, Knex universal DB factory
│   ├── database/             # Dialect-agnostic migrations (001 - 007) & seeds
│   ├── common/               # AppError, 422 error handler, camelCase envelopes
│   ├── modules/
│   │   ├── 01_auth/          # Auth, local JWT & Supabase Auth adapters
│   │   ├── 02_users/         # Users, Staff, and Customer CRM
│   │   ├── 03_products/      # Products & brand variants (+560 markup)
│   │   ├── 04_plans/         # Plans with lifecycle policies (pause/renew/close)
│   │   ├── 05_subscriptions/ # Subscriptions, quotes & quotation templates
│   │   ├── 06_invoices/      # Invoicing, taxes & billing day generator
│   │   ├── 07_discounts/     # Discount rules engine (auto-applied on billing)
│   │   ├── 08_payments/      # Payment recording & invoice balance reconciliation
│   │   └── 09_reporting/     # High-speed aggregate analytics dashboard
│   ├── app.ts                # Express application with CORS for localhost:5173
│   └── server.ts             # Server startup & graceful shutdown
├── knexfile.ts               # Universal Knex configuration
├── .env.example              # Dual database config template
├── package.json
└── tsconfig.json
```

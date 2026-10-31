# Brightloop — Subscription Management & Recurring Billing

A production-grade, standalone financial accounting and subscription billing platform inspired by high-craft ERP systems and modern subscription management. Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**, pre-configured with **Mock Service Worker (MSW v2)** and persistent in-browser `localStorage` database for instant zero-dependency deployment to **Vercel**.

Designed to the **Swiss Financial Ledger** design specification: light-mode archival paper aesthetics, editorial typography, monospace tabular numerals, and high-density financial data tables.

---

## ⚡ Instant Vercel Deployment

Deploy with one click or import via GitHub:

### Option 1: Vercel Web Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new) and import **`nehkaljames/odoo-hackathon-mock`**.
2. **Framework Preset:** `Vite`
3. **Root Directory:** `./` (Default root)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Click **Deploy** — No environment variables required!

### Option 2: Vercel CLI
```bash
npm install
npx vercel --prod
```

---

## 🔑 Demo Credentials

The platform initializes with pre-seeded data in `localStorage`. You can switch between roles or use the one-click quick login buttons on the login screen:

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `Test@1234!` | Full executive access: Finance Dashboard, Subscriptions, Invoices, Payments, Products, Plans, Settings |
| **Staff** | `staff@test.com` | `Test@1234!` | Operational access: Contract management, billing execution, payments recording, invoice drafting |
| **Customer** | `customer@test.com` | `Test@1234!` | Self-service Portal (`/portal`): Review own contracts, outstanding balances, and download invoices |

---

## ✨ Features & Architecture

### 1. Executive Finance Dashboard (`/dashboard`)
- **Key Metrics:** Active Subscriptions, MRR, Revenue Collected, and Outstanding / Overdue Amounts.
- **Dynamic Trends:** Interactive Recharts revenue trend breakdown (Daily, Weekly, Monthly) with date range filters.
- **Contract Breakdown:** Donut distribution chart of subscriptions across life-cycle states.
- **Overdue Invoices Ledger:** Prioritized delinquent invoice tracking with days overdue and direct invoice links.

### 2. Subscription Management (`/subscriptions`, `/subscriptions/:id`)
- **Lifecycle Engine:** `Draft` ➔ `Quotation` ➔ `Confirmed` ➔ `Active` ➔ `Paused` ➔ `Closed` state machine.
- **Flexible Billing Schedules:** Daily, Weekly, Monthly, Quarterly, and Yearly recurring intervals.
- **Multi-Line Contract Builder:** Add products with quantity, variant configuration, multi-tax selection, and manual discount entries.
- **Audit History:** Full chronological timeline of state transitions, plan modifications, and renewals.

### 3. Invoices & Billing Operations (`/invoices`, `/invoices/:id`)
- **Automated Billing Runs:** Bulk invoice generator with dry-run estimation, target date filtering, and execution summary.
- **Invoice Lifecycle:** `Draft` ➔ `Confirmed` ➔ `Paid` / `Cancelled` / `Overdue` tracking.
- **Payments & Ledger Reconciliations:** Real-time multi-payment allocation against open balances.
- **Print & PDF Support:** Clean, printable tax invoice layout with GST breakdown and company details.

### 4. Payments Log (`/payments`)
- **Reconciliation Audit:** Searchable audit trail of Cash, Card, Bank Transfer, UPI, and Cheque receipts linked directly to customer invoices.
- **Collection Volume:** Live aggregates of total payment volume and filtered transaction totals.

### 5. Customer Self-Service Portal (`/portal`)
- **Self-Service Overview:** Summary of active recurring plans and immediate outstanding balances.
- **Scoped Data Isolation:** Strict token-based customer boundary ensuring clients view only their own contracts and invoices.
- **Tab Navigation:** Deep-linked tabs (`?tab=subscriptions` & `?tab=invoices`) with persistent URL state.

---

## 🎨 Design System (`DESIGN.md` Compliance)

- **Palette:** Alabaster canvas (`#F6F5F2`), ledger white surfaces (`#FFFFFF`), hairline structural rules (`#DCDAD4`), verdigris primary accent (`#0A5C52`), and cinnabar danger accents (`#B82E1F`).
- **Typography:**
  - **Headings & UI:** `@fontsource/plus-jakarta-sans`
  - **Financial KPIs & Grand Totals:** `@fontsource/newsreader` (Serif Display)
  - **Tabular Data, Currency & IDs:** `@fontsource/ibm-plex-mono` with `tabular-nums`
- **Formatters:** Indian grouping currency formatting (`₹1,51,040.00`) and standard date format (`DD MMM YYYY`).
- **Status Badges:** Standard 3px radius architectural tags with 6px semantic indicator dots.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/nehkaljames/odoo-hackathon-mock.git
cd odoo-hackathon-mock

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build
```

---

## 📂 Project Structure

```
├── public/                 # Static assets & MSW Service Worker
│   ├── favicon.svg
│   ├── icons.svg
│   └── mockServiceWorker.js
├── src/
│   ├── app/                # App layout, routing, guards, and navigation
│   ├── components/shared/  # Reusable DataTable, StatusBadge, PageHeader, FilterBar
│   ├── features/           # Modular domain features:
│   │   ├── auth/           # Login, Signup, Password Rules, Store
│   │   ├── dashboard/      # KPI Cards, Revenue Chart, Donut, Overdue Table
│   │   ├── subscriptions/  # Subscriptions list, stepper, forms, detail page
│   │   ├── invoices/       # Invoices list, generator, detail page
│   │   ├── payments/       # Payments log, record payment modal
│   │   ├── products/       # Products catalog & variants
│   │   ├── plans/          # Recurring plan templates
│   │   └── portal/         # Customer self-service portal
│   ├── lib/                # API client, date/currency formatters, query client
│   ├── mocks/              # MSW browser setup, handlers, and localStorage DB
│   └── styles/             # Global CSS and DESIGN.md theme tokens
├── vercel.json             # Vercel SPA filesystem rewrite rules
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS theme configuration
```

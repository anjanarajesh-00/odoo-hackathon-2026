# Brightloop (Mock Edition) - Standalone Frontend

A fully functional, standalone build of **Brightloop B2B/B2C Recurring Billing & Subscription Management Platform** pre-configured with in-browser Mock Service Worker (MSW) and `localStorage` persistence.

Designed for instant zero-dependency deployment to **Vercel** or any static host.

---

## 🚀 Quick Deployment to Vercel

### Option 1: Vercel CLI
```bash
cd frontend-mock
npm install
npx vercel
```

### Option 2: Git Repository Import
1. Set the **Root Directory** in the Vercel project settings to `frontend-mock`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. No required environment variables! Mocks run automatically in the browser.

---

## 👥 Demo Logins

The database initializes with seed records in `localStorage`. You can switch between roles or reset at any time:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `Test@1234!` | Full platform access (Dashboard, Products, Plans, Subscriptions, Invoices, Payments) |
| **Staff** | `staff@test.com` | `Test@1234!` | Operational access (Products, Plans, Subscriptions, Invoices, Payments) |
| **Customer** | `customer@test.com` | `Test@1234!` | Customer self-service portal (`/portal`) scoped to own contracts and invoices |

---

## 🛠️ Local Development

```bash
cd frontend-mock
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 📦 Tech Stack
- **Framework:** React 18 + Vite
- **Router:** React Router v6 (Data Router)
- **Data Fetching:** TanStack React Query v5
- **Forms & Validation:** React Hook Form + Zod
- **Mocking:** Mock Service Worker (MSW v2) with in-browser Service Worker
- **Styling:** Tailwind CSS + DESIGN.md Swiss Financial Ledger theme
- **Typography:** `@fontsource/plus-jakarta-sans`, `@fontsource/newsreader`, `@fontsource/ibm-plex-mono`


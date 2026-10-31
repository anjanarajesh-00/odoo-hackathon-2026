# Brightloop Subscription Management System

A unified software platform that runs the full life of a subscription business, from setting up products and plans to managing quotation-to-subscription lifecycles, automated billing, payment reconciliation, and recurring revenue analytics.

Built for the **Odoo Hackathon 2026**.

---

## 🏗️ Repository Architecture

This repository is structured as a monorepo containing both the frontend and backend services:

```
odoo-hackathon-2026/
├── frontend/        # React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
├── backend/         # Node.js + Express + TypeScript + Knex.js
├── .gitignore       # Root ignore rules
└── README.md        # Monorepo documentation and setup instructions
```

---

## 💻 Frontend (React + TypeScript)

The frontend is built with:
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with Odoo-inspired light theme (`--primary: hsl(175 60% 35%)`, CSS variables, no hardcoded colors)
- **State Management:** TanStack Query v5 (server data) + Zustand persisted to localStorage (auth & role session)
- **Forms & Validation:** React Hook Form + Zod (live password strength checklist, server error mapping)
- **Tables & Visualization:** TanStack Table v8 (server-side pagination, sorting, search, URL query persistence) + Recharts
- **Mock Layer:** Mock Service Worker (MSW v2) with mock database persisted to localStorage for standalone development (`VITE_USE_MOCKS=true`)

### Frontend Setup->

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run at `http://localhost:5173`.

### Demo Credentials (when `VITE_USE_MOCKS=true`)
- **Admin:** `admin@test.com` / `Test@1234!`
- **Staff:** `staff@test.com` / `Test@1234!`
- **Customer:** `customer@test.com` / `Test@1234!`

---

## ⚙️ Backend (Node.js + Express + TypeScript)

The backend provides a RESTful API powering subscriptions, billing, products, plans, and reporting.

- **Stack:** Express, TypeScript, Knex.js SQL query builder & migrations
- **Authentication:** Local JWT / Supabase Auth provider adapters

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Run migrations and seed data
npm run migrate
npm run seed
npm run dev
```

---

## 🚀 Branching & Releases

- `main`: Production release branch.
- `backend`: Backend feature development.
- `v1`: Combined release candidate containing both `frontend/` and `backend/`.

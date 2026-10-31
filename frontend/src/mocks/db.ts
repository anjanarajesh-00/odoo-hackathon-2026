import type { Role, PlanState } from "@/types/enums";
import type { Product } from "@/features/products/schemas";
import type { Plan } from "@/features/plans/schemas";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  customerId?: string;
  password?: string;
}

const USERS_KEY = "brightloop_mock_db_users";
const PRODUCTS_KEY = "brightloop_mock_db_products";
const PLANS_KEY = "brightloop_mock_db_plans";

const initialUsers: MockUser[] = [
  {
    id: "usr_admin_1",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    password: "Test@1234!",
  },
  {
    id: "usr_staff_1",
    name: "Staff Member",
    email: "staff@test.com",
    role: "staff",
    password: "Test@1234!",
  },
  {
    id: "usr_customer_1",
    name: "Small Business Customer",
    email: "customer@test.com",
    role: "customer",
    customerId: "cust_1",
    password: "Test@1234!",
  },
];

const initialProducts: Product[] = [
  {
    id: "prod_1",
    name: "Cloud ERP Enterprise Edition",
    type: "service",
    salesPrice: 2499,
    costPrice: 900,
    notes: "Core enterprise resource planning platform with multi-company modules.",
    variants: [
      { id: "var_1", attribute: "Brand", value: "Odoo", extraPrice: 560 },
      { id: "var_2", attribute: "Hosting", value: "Dedicated Cloud", extraPrice: 750 },
    ],
  },
  {
    id: "prod_2",
    name: "CRM & Lead Pipeline Automation",
    type: "service",
    salesPrice: 1299,
    costPrice: 400,
    notes: "Automated sales tracking, WhatsApp messaging and quote builder.",
    variants: [
      { id: "var_3", attribute: "Brand", value: "Odoo", extraPrice: 560 },
    ],
  },
  {
    id: "prod_3",
    name: "POS Hardware Terminal",
    type: "goods",
    salesPrice: 15499,
    costPrice: 11000,
    notes: "Touchscreen barcode terminal with thermal receipt printer.",
    variants: [
      { id: "var_4", attribute: "Color", value: "Matte Black", extraPrice: 0 },
      { id: "var_5", attribute: "Color", value: "Silver Frost", extraPrice: 450 },
    ],
  },
  {
    id: "prod_4",
    name: "Payroll & HR Attendance Suite",
    type: "service",
    salesPrice: 999,
    costPrice: 250,
    notes: "Bio-metric integration and automated salary slip generation.",
    variants: [],
  },
  {
    id: "prod_5",
    name: "E-commerce Website Builder Pro",
    type: "service",
    salesPrice: 1899,
    costPrice: 600,
    notes: "Integrated payment gateways, cart abandonment recovery and themes.",
    variants: [
      { id: "var_6", attribute: "Storage", value: "100 GB High Speed", extraPrice: 300 },
    ],
  },
];

const initialPlans: Plan[] = [
  {
    id: "plan_1",
    name: "Starter Monthly Billing",
    price: 1499,
    billingPeriod: "monthly",
    minQuantity: 1,
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    state: "open",
  },
  {
    id: "plan_2",
    name: "Growth Annual Enterprise",
    price: 14999,
    billingPeriod: "yearly",
    minQuantity: 5,
    availableFrom: "2026-01-01",
    availableTo: "2026-12-31",
    autoClose: false,
    allowEarlyClose: false,
    allowPause: true,
    allowRenew: true,
    state: "open",
  },
  {
    id: "plan_3",
    name: "Daily Burst Compute Pass",
    price: 99,
    billingPeriod: "daily",
    minQuantity: 1,
    availableFrom: "2026-02-01",
    availableTo: "2026-06-30",
    autoClose: true,
    allowEarlyClose: true,
    allowPause: false,
    allowRenew: false,
    state: "open",
  },
  {
    id: "plan_4",
    name: "Weekly Agile Sprint Tier",
    price: 499,
    billingPeriod: "weekly",
    minQuantity: 2,
    availableFrom: "2026-01-15",
    availableTo: "2026-08-31",
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    state: "paused",
  },
  {
    id: "plan_5",
    name: "Legacy Small Shop Plan",
    price: 799,
    billingPeriod: "monthly",
    minQuantity: 1,
    availableFrom: "2025-01-01",
    availableTo: "2025-12-31",
    autoClose: true,
    allowEarlyClose: true,
    allowPause: false,
    allowRenew: true,
    state: "closed",
  },
  {
    id: "plan_6",
    name: "Corporate VIP Multi-Year",
    price: 29999,
    billingPeriod: "yearly",
    minQuantity: 10,
    availableFrom: "2026-03-01",
    availableTo: "2028-12-31",
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    state: "open",
  },
];

export function getStoredUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(raw);
  } catch {
    return initialUsers;
  }
}

export function saveStoredUsers(users: MockUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    return JSON.parse(raw);
  } catch {
    return initialProducts;
  }
}

export function saveStoredProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getStoredPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) {
      localStorage.setItem(PLANS_KEY, JSON.stringify(initialPlans));
      return initialPlans;
    }
    return JSON.parse(raw);
  } catch {
    return initialPlans;
  }
}

export function saveStoredPlans(plans: Plan[]) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

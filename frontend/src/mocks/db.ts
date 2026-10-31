import type { Role, PlanState, SubscriptionStatus, InvoiceStatus } from "@/types/enums";
import type { Product } from "@/features/products/schemas";
import type { Plan } from "@/features/plans/schemas";
import type {
  Subscription,
  SubscriptionHistoryItem,
  CustomerLookup,
  TaxLookup,
  QuotationTemplate,
} from "@/features/subscriptions/schemas";
import type { Invoice } from "@/features/invoices/schemas";
import type { Payment } from "@/features/payments/schemas";
import type { PaymentMethod } from "@/types/enums";

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
const SUBSCRIPTIONS_KEY = "brightloop_mock_db_subscriptions";
const SUBSCRIPTION_HISTORY_KEY = "brightloop_mock_db_subscription_history";
const CUSTOMERS_KEY = "brightloop_mock_db_customers";
const TAXES_KEY = "brightloop_mock_db_taxes";
const TEMPLATES_KEY = "brightloop_mock_db_templates";
const INVOICES_KEY = "brightloop_mock_db_invoices";
const PAYMENTS_KEY = "brightloop_mock_db_payments";

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
    name: "Aarav Sharma",
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
    2026: true,
    availableTo: "2026-12-31",
    autoClose: false,
    allowEarlyClose: false,
    allowPause: true,
    allowRenew: true,
    state: "open",
  } as any,
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

const initialTaxes: TaxLookup[] = [
  { id: "tax_18", name: "GST 18%", rate: 0.18 },
  { id: "tax_12", name: "GST 12%", rate: 0.12 },
  { id: "tax_5", name: "GST 5%", rate: 0.05 },
];

const initialCustomers: CustomerLookup[] = [
  { id: "cust_1", name: "Aarav Sharma", email: "customer@test.com", company: "Sharma Retailers" },
  { id: "cust_2", name: "Priya Patel", email: "priya@patellogistics.in", company: "Patel Logistics Pvt Ltd" },
  { id: "cust_3", name: "Rohan Varma", email: "rohan@varmatech.co", company: "Varma Tech Labs" },
  { id: "cust_4", name: "Ananya Iyer", email: "ananya@iyerconsulting.com", company: "Iyer Cloud Consulting" },
  { id: "cust_5", name: "Vikram Malhotra", email: "vikram@malhotratextiles.com", company: "Malhotra Textiles" },
  { id: "cust_6", name: "Neha Kulkarni", email: "neha@kulkarnistores.in", company: "Kulkarni Fresh Mart" },
  { id: "cust_7", name: "Siddharth Rao", email: "siddharth@raomedia.com", company: "Rao Digital Media" },
  { id: "cust_8", name: "Pooja Hegde", email: "pooja@hegdehealth.org", company: "Hegde Diagnostics" },
  { id: "cust_9", name: "Kabir Mehta", email: "kabir@mehtaauto.com", company: "Mehta Auto Components" },
  { id: "cust_10", name: "Diya Sengupta", email: "diya@senguptafashion.com", company: "Sengupta Apparel" },
  { id: "cust_11", name: "Arjun Nair", email: "arjun@nairlogistics.in", company: "Nair Cargo Express" },
  { id: "cust_12", name: "Sunita Reddy", email: "sunita@reddypharma.com", company: "Reddy Pharmaceuticals" },
  { id: "cust_13", name: "Gaurav Joshi", email: "gaurav@joshidesigns.studio", company: "Joshi Design House" },
  { id: "cust_14", name: "Ritu Verma", email: "ritu@vermahotel.in", company: "Verma Palace Hospitality" },
  { id: "cust_15", name: "Devansh Chawla", email: "devansh@chawlafoods.com", company: "Chawla Agro Foods" },
  { id: "cust_16", name: "Ishaan Kapoor", email: "ishaan@kapoorfin.com", company: "Kapoor Wealth Advisory" },
  { id: "cust_17", name: "Meera Deshmukh", email: "meera@deshmukhchem.in", company: "Deshmukh Agro Chemicals" },
  { id: "cust_18", name: "Kunal Bansal", email: "kunal@bansalsteel.com", company: "Bansal Alloys & Steel" },
  { id: "cust_19", name: "Sneha Mukherjee", email: "sneha@mukherjeebooks.in", company: "Mukherjee Publications" },
  { id: "cust_20", name: "Manish Agarwal", email: "manish@agarwalhardware.com", company: "Agarwal Hardware Syndicate" },
];

const initialTemplates: QuotationTemplate[] = [
  {
    id: "tpl_1",
    name: "Enterprise ERP Standard Quote",
    planId: "plan_1",
    validityDays: 14,
    lines: [
      { productId: "prod_1", variantId: "var_1", quantity: 2 },
      { productId: "prod_2", variantId: "var_3", quantity: 1 },
    ],
  },
  {
    id: "tpl_2",
    name: "Retail POS Kickstart Package",
    planId: "plan_1",
    validityDays: 30,
    lines: [
      { productId: "prod_3", variantId: "var_4", quantity: 1 },
      { productId: "prod_2", quantity: 1 },
    ],
  },
  {
    id: "tpl_3",
    name: "High Growth Corporate Annual Contract",
    planId: "plan_2",
    validityDays: 21,
    lines: [
      { productId: "prod_1", variantId: "var_2", quantity: 5 },
      { productId: "prod_4", quantity: 5 },
      { productId: "prod_5", quantity: 1 },
    ],
  },
];

// Helper to generate 120+ realistic seeded subscriptions
function generateSeedSubscriptions(): { subscriptions: Subscription[]; history: Record<string, SubscriptionHistoryItem[]> } {
  const statuses: SubscriptionStatus[] = [
    "draft", "quotation", "confirmed", "active", "active", "active", "closed"
  ];
  const terms: ("Immediate" | "Net 15" | "Net 30" | "Net 60")[] = [
    "Immediate", "Net 15", "Net 30", "Net 60"
  ];

  const subs: Subscription[] = [];
  const histMap: Record<string, SubscriptionHistoryItem[]> = {};

  const now = new Date();

  for (let i = 1; i <= 125; i++) {
    const cust = initialCustomers[(i - 1) % initialCustomers.length];
    const plan = initialPlans[(i - 1) % initialPlans.length];
    const status = statuses[i % statuses.length];
    const term = terms[i % terms.length];

    // Some expiring in 5-25 days (within 30 days) for testing "Needs attention" filter
    const isNearExpiry = i % 4 === 0;
    const startOffsetDays = isNearExpiry ? -300 : -(i * 2);
    const expiryOffsetDays = isNearExpiry ? 15 : 180 + (i * 3);

    const startDate = new Date(now.getTime() + startOffsetDays * 86400000).toISOString().split("T")[0];
    const expiryDate = new Date(now.getTime() + expiryOffsetDays * 86400000).toISOString().split("T")[0];
    const quoteValidUntil = new Date(now.getTime() + (isNearExpiry ? 2 : 14) * 86400000).toISOString().split("T")[0];

    const prod1 = initialProducts[(i - 1) % initialProducts.length];
    const variant1 = prod1.variants && prod1.variants.length > 0 ? prod1.variants[0] : undefined;
    const unitPrice1 = prod1.salesPrice + (variant1 ? variant1.extraPrice : 0);
    const qty1 = Math.max(plan.minQuantity, (i % 3) + 1);
    const lineAmount1 = unitPrice1 * qty1;
    const taxObj1 = initialTaxes[0]; // GST 18%
    const taxAmt1 = lineAmount1 * taxObj1.rate;

    const lines = [
      {
        id: `line_${i}_1`,
        productId: prod1.id,
        product: { id: prod1.id, name: prod1.name, salesPrice: prod1.salesPrice },
        variantId: variant1?.id,
        variant: variant1 ? { id: variant1.id || "var", value: variant1.value, extraPrice: variant1.extraPrice } : undefined,
        quantity: qty1,
        unitPrice: unitPrice1,
        taxes: [{ id: taxObj1.id, name: taxObj1.name, amount: Math.round(taxAmt1 * 100) / 100 }],
        discountAmount: 0,
        amount: Math.round(lineAmount1 * 100) / 100,
      },
    ];

    const subtotal = lineAmount1;
    const taxTotal = taxAmt1;
    const total = subtotal + taxTotal;

    const subId = `sub_${i}`;
    const subNumber = `SUB-2026-${String(i).padStart(5, "0")}`;

    const sub: Subscription = {
      id: subId,
      number: subNumber,
      status,
      customerId: cust.id,
      customer: { id: cust.id, name: cust.name, email: cust.email },
      planId: plan.id,
      plan: { id: plan.id, name: plan.name, billingPeriod: plan.billingPeriod, minQuantity: plan.minQuantity },
      startDate,
      expiryDate,
      quotationValidUntil: quoteValidUntil,
      nextInvoiceDate: status === "active" ? new Date(now.getTime() + 12 * 86400000).toISOString().split("T")[0] : undefined,
      paymentTerms: term,
      lines,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      discountTotal: 0,
      total: Math.round(total * 100) / 100,
      createdAt: new Date(now.getTime() + startOffsetDays * 86400000).toISOString(),
    };

    subs.push(sub);

    // Initial history
    const historyEntries: SubscriptionHistoryItem[] = [
      {
        from: "created",
        to: "draft",
        by: "Staff Member",
        at: new Date(now.getTime() + startOffsetDays * 86400000).toISOString(),
        note: "Subscription initialized as draft",
      },
    ];

    if (status !== "draft") {
      historyEntries.push({
        from: "draft",
        to: "quotation",
        by: "Staff Member",
        at: new Date(now.getTime() + (startOffsetDays + 1) * 86400000).toISOString(),
        note: "Quotation prepared and dispatched",
      });
    }
    if (status === "confirmed" || status === "active" || status === "closed") {
      historyEntries.push({
        from: "quotation",
        to: "confirmed",
        by: "Staff Member",
        at: new Date(now.getTime() + (startOffsetDays + 3) * 86400000).toISOString(),
        note: "Customer accepted terms and confirmed quote",
      });
    }
    if (status === "active" || status === "closed") {
      historyEntries.push({
        from: "confirmed",
        to: "active",
        by: "Admin User",
        at: new Date(now.getTime() + (startOffsetDays + 5) * 86400000).toISOString(),
        note: "Subscription activated for billing lifecycle",
      });
    }
    if (status === "closed") {
      historyEntries.push({
        from: "active",
        to: "closed",
        by: "Admin User",
        at: new Date(now.getTime() - 2 * 86400000).toISOString(),
        note: "Subscription contract reached end of term and closed",
      });
    }

    histMap[subId] = historyEntries;
  }

  return { subscriptions: subs, history: histMap };
}

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

export function getStoredCustomers(): CustomerLookup[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(initialCustomers));
      return initialCustomers;
    }
    return JSON.parse(raw);
  } catch {
    return initialCustomers;
  }
}

export function getStoredTaxes(): TaxLookup[] {
  try {
    const raw = localStorage.getItem(TAXES_KEY);
    if (!raw) {
      localStorage.setItem(TAXES_KEY, JSON.stringify(initialTaxes));
      return initialTaxes;
    }
    return JSON.parse(raw);
  } catch {
    return initialTaxes;
  }
}

export function getStoredTemplates(): QuotationTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(initialTemplates));
      return initialTemplates;
    }
    return JSON.parse(raw);
  } catch {
    return initialTemplates;
  }
}

export function getStoredSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (!raw) {
      const seeded = generateSeedSubscriptions();
      localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(seeded.subscriptions));
      localStorage.setItem(SUBSCRIPTION_HISTORY_KEY, JSON.stringify(seeded.history));
      return seeded.subscriptions;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredSubscriptions(subs: Subscription[]) {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
}

export function getStoredSubscriptionHistory(id: string): SubscriptionHistoryItem[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_HISTORY_KEY);
    const map: Record<string, SubscriptionHistoryItem[]> = raw ? JSON.parse(raw) : {};
    return map[id] || [];
  } catch {
    return [];
  }
}

export function addStoredSubscriptionHistory(id: string, entry: SubscriptionHistoryItem) {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_HISTORY_KEY);
    const map: Record<string, SubscriptionHistoryItem[]> = raw ? JSON.parse(raw) : {};
    const existing = map[id] || [];
    existing.unshift(entry);
    map[id] = existing;
    localStorage.setItem(SUBSCRIPTION_HISTORY_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Failed to add subscription history", err);
  }
}

// ----------------- Invoices Seed & Store -----------------

function generateSeedInvoices(): Invoice[] {
  const subscriptions = getStoredSubscriptions();
  const invoices: Invoice[] = [];
  const now = new Date();

  let invoiceSeq = 1;

  // Generate 4-5 cycles of invoices for each subscription to create 500+ invoices
  subscriptions.forEach((sub, sIdx) => {
    const cyclesCount = (sIdx % 4) + 3; // 3 to 6 invoices per subscription
    const subStartDate = new Date(sub.startDate);

    for (let c = 0; c < cyclesCount; c++) {
      const invDate = new Date(subStartDate.getTime() + c * 30 * 86400000);
      const dueDate = new Date(invDate.getTime() + 15 * 86400000);
      const isPastDue = dueDate.getTime() < now.getTime();

      let status: InvoiceStatus = "paid";
      let amountPaid = sub.total;
      let balance = 0;

      // Create variety of statuses: ~40 overdue, some confirmed, draft, cancelled
      if (invoiceSeq % 12 === 0 && isPastDue) {
        // Overdue confirmed invoice
        status = "confirmed";
        amountPaid = 0;
        balance = sub.total;
      } else if (invoiceSeq % 15 === 0) {
        status = "draft";
        amountPaid = 0;
        balance = sub.total;
      } else if (invoiceSeq % 25 === 0) {
        status = "cancelled";
        amountPaid = 0;
        balance = 0;
      } else if (!isPastDue && invoiceSeq % 7 === 0) {
        // Pending recent confirmed invoice
        status = "confirmed";
        amountPaid = 0;
        balance = sub.total;
      } else {
        // Paid invoice
        status = "paid";
        amountPaid = sub.total;
        balance = 0;
      }

      const isOverdue = status === "confirmed" && isPastDue && balance > 0;

      const lines = sub.lines.map((l, lIdx) => ({
        id: `inv_line_${invoiceSeq}_${lIdx}`,
        description: `${l.product.name}${l.variant ? ` (${l.variant.value})` : ""} - Billing Cycle ${c + 1}`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxAmount: l.taxes.reduce((sum, t) => sum + t.amount, 0),
        discountAmount: l.discountAmount || 0,
        amount: l.amount,
      }));

      const paymentMethods: PaymentMethod[] = ["bank_transfer", "upi", "card", "cash", "cheque"];
      const invPayments: any[] = [];

      if (status === "paid") {
        // 1-2 payments summing exactly to total
        const isSplit = invoiceSeq % 3 === 0 && sub.total > 1000;
        if (isSplit) {
          const firstPart = Math.round((sub.total * 0.6) * 100) / 100;
          const secondPart = Math.round((sub.total - firstPart) * 100) / 100;
          const pMethod1 = paymentMethods[invoiceSeq % paymentMethods.length];
          const pMethod2 = paymentMethods[(invoiceSeq + 1) % paymentMethods.length];

          invPayments.push({
            id: `pay_${invoiceSeq}_1`,
            method: pMethod1,
            amount: firstPart,
            date: new Date(dueDate.getTime() - 5 * 86400000).toISOString().split("T")[0],
            note: "Advance partial installment",
          });
          invPayments.push({
            id: `pay_${invoiceSeq}_2`,
            method: pMethod2,
            amount: secondPart,
            date: new Date(dueDate.getTime() - 1 * 86400000).toISOString().split("T")[0],
            note: "Balance settlement",
          });
        } else {
          invPayments.push({
            id: `pay_${invoiceSeq}_1`,
            method: paymentMethods[invoiceSeq % paymentMethods.length],
            amount: sub.total,
            date: new Date(dueDate.getTime() - 2 * 86400000).toISOString().split("T")[0],
            note: "Full settlement",
          });
        }
      } else if (status === "confirmed" && !isPastDue && invoiceSeq % 3 === 0) {
        // Confirmed invoice with partial payment
        const partialAmt = Math.round((sub.total * 0.4) * 100) / 100;
        amountPaid = partialAmt;
        balance = Math.round((sub.total - partialAmt) * 100) / 100;
        invPayments.push({
          id: `pay_${invoiceSeq}_1`,
          method: paymentMethods[invoiceSeq % paymentMethods.length],
          amount: partialAmt,
          date: new Date(dueDate.getTime() - 3 * 86400000).toISOString().split("T")[0],
          note: "Partial payment received",
        });
      }

      const inv: Invoice = {
        id: `inv_${invoiceSeq}`,
        number: `INV-2026-${String(invoiceSeq).padStart(5, "0")}`,
        status,
        isOverdue,
        customerId: sub.customerId,
        customer: {
          id: sub.customer.id,
          name: sub.customer.name,
          email: sub.customer.email,
        },
        subscriptionId: sub.id,
        subscription: {
          id: sub.id,
          number: sub.number,
        },
        periodStart: invDate.toISOString().split("T")[0],
        periodEnd: new Date(invDate.getTime() + 30 * 86400000).toISOString().split("T")[0],
        invoiceDate: invDate.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        lines,
        subtotal: sub.subtotal,
        taxTotal: sub.taxTotal,
        discountTotal: sub.discountTotal || 0,
        total: sub.total,
        amountPaid,
        balance,
        payments: invPayments,
        createdAt: invDate.toISOString(),
      };

      invoices.push(inv);
      invoiceSeq++;
    }
  });

  return invoices;
}

export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (!raw) {
      const seeded = generateSeedInvoices();
      localStorage.setItem(INVOICES_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredInvoices(invoices: Invoice[]) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

// ----------------- Payments Store & Handlers -----------------

export function getStoredPayments(): Payment[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      // Derive payments from the stored invoices
      const invoices = getStoredInvoices();
      const allPayments: Payment[] = [];

      invoices.forEach((inv) => {
        (inv.payments || []).forEach((p) => {
          allPayments.push({
            id: p.id,
            invoiceId: inv.id,
            invoice: {
              id: inv.id,
              number: inv.number,
            },
            customerId: inv.customerId,
            customer: {
              id: inv.customer.id,
              name: inv.customer.name,
            },
            method: (p.method as PaymentMethod) || "bank_transfer",
            amount: p.amount,
            date: p.date,
            note: p.note,
            createdAt: `${p.date}T10:00:00.000Z`,
          });
        });
      });

      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(allPayments));
      return allPayments;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredPayments(payments: Payment[]) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

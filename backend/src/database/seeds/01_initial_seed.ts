import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Starting comprehensive database seed for Brightloop Contract v0.1...');

  // 1. Clean tables in reverse foreign key order
  await knex('payments').del();
  await knex('invoice_lines').del();
  await knex('invoices').del();
  await knex('subscription_history').del();
  await knex('subscription_lines').del();
  await knex('subscriptions').del();
  await knex('quotation_templates').del();
  await knex('discounts').del();
  await knex('taxes').del();
  await knex('plans').del();
  await knex('product_variants').del();
  await knex('products').del();
  await knex('customers').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('Str0ng!Pass1', 10);

  // 2. Insert Users: 1 Admin, 2 Staff
  const adminUser = {
    id: 'u_admin_01',
    name: 'Admin User',
    email: 'admin@brightloop.com',
    password_hash: passwordHash,
    role: 'admin',
    is_active: true,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  };

  const staffUsers = [
    {
      id: 'u_staff_01',
      name: 'Sarah Sales Rep',
      email: 'sarah@brightloop.com',
      password_hash: passwordHash,
      role: 'staff',
      is_active: true,
      created_at: new Date('2026-01-05'),
      updated_at: new Date('2026-01-05'),
    },
    {
      id: 'u_staff_02',
      name: 'Alex Account Exec',
      email: 'alex@brightloop.com',
      password_hash: passwordHash,
      role: 'staff',
      is_active: true,
      created_at: new Date('2026-01-10'),
      updated_at: new Date('2026-01-10'),
    },
  ];

  await knex('users').insert([adminUser, ...staffUsers]);

  // 3. Insert 20 Customers + Linked Customer Users
  const customerNames = [
    { name: 'Asha Nair', company: 'Asha Stores', city: 'Kochi', phone: '+91 9876543210' },
    { name: 'Rahul Sharma', company: 'TechNova Solutions', city: 'Bengaluru', phone: '+91 9876543211' },
    { name: 'Priya Patel', company: 'Gujarat Textiles', city: 'Ahmedabad', phone: '+91 9876543212' },
    { name: 'Vikram Verma', company: 'Apex Logistics', city: 'Mumbai', phone: '+91 9876543213' },
    { name: 'Ananya Roy', company: 'Kolkata Krafts', city: 'Kolkata', phone: '+91 9876543214' },
    { name: 'Rohan Mehra', company: 'Delhi Dynamics', city: 'New Delhi', phone: '+91 9876543215' },
    { name: 'Sneha Reddy', company: 'Hyderabad CloudTech', city: 'Hyderabad', phone: '+91 9876543216' },
    { name: 'Karthik Raja', company: 'Chennai Automations', city: 'Chennai', phone: '+91 9876543217' },
    { name: 'Amitabh Joshi', company: 'Pune Precision Tools', city: 'Pune', phone: '+91 9876543218' },
    { name: 'Deepa Sundaram', company: 'Coimbatore Cotton Hub', city: 'Coimbatore', phone: '+91 9876543219' },
    { name: 'Manish Gupta', company: 'Jaipur Gems', city: 'Jaipur', phone: '+91 9876543220' },
    { name: 'Sunita Rao', company: 'Vizag Marine Supplies', city: 'Visakhapatnam', phone: '+91 9876543221' },
    { name: 'Nikhil Kulkarni', company: 'Nagpur Oranges Direct', city: 'Nagpur', phone: '+91 9876543222' },
    { name: 'Pooja Agarwal', company: 'Lucknow Chikan Mart', city: 'Lucknow', phone: '+91 9876543223' },
    { name: 'Gaurav Bhatia', company: 'Chandigarh Softwares', city: 'Chandigarh', phone: '+91 9876543224' },
    { name: 'Kavita Menon', company: 'Malabar Spices', city: 'Calicut', phone: '+91 9876543225' },
    { name: 'Sanjay Dutt', company: 'Indore Engineering', city: 'Indore', phone: '+91 9876543226' },
    { name: 'Bhavna Shah', company: 'Surat Diamond Works', city: 'Surat', phone: '+91 9876543227' },
    { name: 'Tanmay Das', company: 'Bhubaneswar IT Labs', city: 'Bhubaneswar', phone: '+91 9876543228' },
    { name: 'Zoya Khan', company: 'Bhopal BioTech', city: 'Bhopal', phone: '+91 9876543229' },
  ];

  const userRows: any[] = [];
  const customerRows: any[] = [];

  customerNames.forEach((c, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const uId = `u_cust_${num}`;
    const cId = `c${idx + 1}`;
    const email = `customer${idx + 1}@shop.com`;

    userRows.push({
      id: uId,
      name: c.name,
      email,
      password_hash: passwordHash,
      role: 'customer',
      is_active: true,
      created_at: new Date('2026-02-01'),
      updated_at: new Date('2026-02-01'),
    });

    customerRows.push({
      id: cId,
      user_id: uId,
      name: c.name,
      company: c.company,
      email,
      phone: c.phone,
      address: `Industrial Area, ${c.city}`,
      created_at: new Date('2026-02-01'),
      updated_at: new Date('2026-02-01'),
    });
  });

  await knex('users').insert(userRows);
  await knex('customers').insert(customerRows);

  // 4. Insert 5 Products with Variants
  const products = [
    {
      id: 'p1',
      name: 'Brightloop CRM',
      type: 'service',
      sales_price: 2000.0,
      cost_price: 1200.0,
      notes: 'Per-seat CRM licence with sales pipelines and contact manager',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'p2',
      name: 'Brightloop ERP Core Suite',
      type: 'service',
      sales_price: 5000.0,
      cost_price: 2800.0,
      notes: 'Complete resource planning software with ledger and billing',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'p3',
      name: 'Additional User Seat',
      type: 'service',
      sales_price: 500.0,
      cost_price: 150.0,
      notes: 'Add-on seat expansion licence',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'p4',
      name: 'Priority 24/7 SLA Support',
      type: 'service',
      sales_price: 1500.0,
      cost_price: 400.0,
      notes: 'Dedicated response within 1 hour',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'p5',
      name: 'Cloud Backup Storage (1TB)',
      type: 'goods',
      sales_price: 800.0,
      cost_price: 200.0,
      notes: 'Encrypted offsite storage vault addon',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('products').insert(products);

  const productVariants = [
    { id: 'v1', product_id: 'p1', attribute: 'Brand', value: 'Odoo', extra_price: 560.0, created_at: new Date(), updated_at: new Date() },
    { id: 'v2', product_id: 'p1', attribute: 'Brand', value: 'Standard', extra_price: 0.0, created_at: new Date(), updated_at: new Date() },
    { id: 'v3', product_id: 'p2', attribute: 'Tier', value: 'Enterprise Edition', extra_price: 1200.0, created_at: new Date(), updated_at: new Date() },
    { id: 'v4', product_id: 'p2', attribute: 'Tier', value: 'Standard Edition', extra_price: 0.0, created_at: new Date(), updated_at: new Date() },
  ];
  await knex('product_variants').insert(productVariants);

  // 5. Insert 6 Plans
  const plans = [
    {
      id: 'pl1',
      name: 'CRM Monthly',
      price: 2000.0,
      billing_period: 'monthly',
      min_quantity: 1,
      available_from: '2026-01-01',
      available_to: '2027-12-31',
      auto_close: true,
      allow_early_close: true,
      allow_pause: true,
      allow_renew: true,
      state: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'pl2',
      name: 'CRM Annual Pro',
      price: 20000.0,
      billing_period: 'yearly',
      min_quantity: 1,
      available_from: '2026-01-01',
      available_to: '2027-12-31',
      auto_close: true,
      allow_early_close: true,
      allow_pause: true,
      allow_renew: true,
      state: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'pl3',
      name: 'ERP Core Monthly',
      price: 5000.0,
      billing_period: 'monthly',
      min_quantity: 1,
      available_from: '2026-01-01',
      available_to: '2027-12-31',
      auto_close: false,
      allow_early_close: true,
      allow_pause: true,
      allow_renew: true,
      state: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'pl4',
      name: 'ERP Enterprise Yearly',
      price: 54000.0,
      billing_period: 'yearly',
      min_quantity: 5,
      available_from: '2026-01-01',
      available_to: '2027-12-31',
      auto_close: true,
      allow_early_close: false,
      allow_pause: false,
      allow_renew: true,
      state: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'pl5',
      name: 'Weekly Sprint Licence',
      price: 600.0,
      billing_period: 'weekly',
      min_quantity: 1,
      available_from: '2026-01-01',
      available_to: '2027-12-31',
      auto_close: true,
      allow_early_close: true,
      allow_pause: true,
      allow_renew: true,
      state: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'pl6',
      name: 'Daily High-Compute Cloud',
      price: 150.0,
      billing_period: 'daily',
      min_quantity: 1,
      available_from: '2026-01-01',
      available_to: '2026-12-31',
      auto_close: true,
      allow_early_close: true,
      allow_pause: true,
      allow_renew: true,
      state: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('plans').insert(plans);

  // 6. Insert 3 Taxes
  const taxes = [
    { id: 't1', name: 'GST 18%', type: 'percentage', rate: 18.0, active: true, created_at: new Date(), updated_at: new Date() },
    { id: 't2', name: 'VAT 5%', type: 'percentage', rate: 5.0, active: true, created_at: new Date(), updated_at: new Date() },
    { id: 't3', name: 'Zero Tax 0%', type: 'percentage', rate: 0.0, active: true, created_at: new Date(), updated_at: new Date() },
  ];
  await knex('taxes').insert(taxes);

  // 7. Insert 3 Discounts
  const discounts = [
    {
      id: 'd1',
      name: 'Bulk seats 10%',
      type: 'percentage',
      value: 10.0,
      min_purchase: 5000.0,
      min_quantity: 10,
      start_date: '2026-01-01',
      end_date: '2027-03-31',
      usage_limit: 500,
      used_count: 35,
      applies_to: 'product',
      product_ids: JSON.stringify(['p1', 'p3']),
      subscription_ids: null,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'd2',
      name: 'Enterprise Growth ₹2000 Off',
      type: 'fixed',
      value: 2000.0,
      min_purchase: 15000.0,
      min_quantity: 1,
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      usage_limit: 100,
      used_count: 14,
      applies_to: 'subscription',
      product_ids: null,
      subscription_ids: JSON.stringify([]),
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'd3',
      name: 'Startup Launch 20%',
      type: 'percentage',
      value: 20.0,
      min_purchase: 0.0,
      min_quantity: 1,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      usage_limit: 50,
      used_count: 5,
      applies_to: 'subscription',
      product_ids: null,
      subscription_ids: JSON.stringify([]),
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('discounts').insert(discounts);

  // 8. Insert Quotation Template
  await knex('quotation_templates').insert({
    id: 'qt1',
    name: 'Enterprise CRM, 50 seats',
    plan_id: 'pl1',
    validity_days: 15,
    lines: JSON.stringify([{ productId: 'p1', variantId: 'v1', quantity: 50 }]),
    created_at: new Date(),
    updated_at: new Date(),
  });

  // 9. Generate 320 Subscriptions in mixed statuses
  console.log('⚡ Generating 320 subscriptions and lines...');
  const subscriptionRows: any[] = [];
  const subLineRows: any[] = [];
  const subHistoryRows: any[] = [];

  const statuses = ['active', 'confirmed', 'quotation', 'draft', 'closed'];

  for (let i = 1; i <= 320; i++) {
    const sId = `s${i}`;
    const sNum = `SUB-2026-${String(i).padStart(5, '0')}`;
    const custIdx = (i % 20) + 1;
    const customerId = `c${custIdx}`;
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];

    const startDate = '2026-01-01';
    const expiryDate = '2027-01-01';
    const nextInvoiceDate = i % 3 === 0 ? '2026-10-31' : '2026-11-15';

    // Pricing
    const qty = 5 + (i % 25);
    const hasVariant = i % 2 === 0;
    const unitPrice = 2000.0 + (hasVariant ? 560.0 : 0.0);
    const subtotal = unitPrice * qty;
    const taxTotal = (subtotal * 18) / 100;
    const total = subtotal + taxTotal;

    subscriptionRows.push({
      id: sId,
      number: sNum,
      status,
      customer_id: customerId,
      plan_id: plan.id,
      start_date: startDate,
      expiry_date: expiryDate,
      quotation_valid_until: '2026-02-15',
      next_invoice_date: nextInvoiceDate,
      payment_terms: 'Net 15',
      subtotal,
      tax_total: taxTotal,
      discount_total: 0,
      total,
      created_at: new Date('2026-01-15'),
      updated_at: new Date('2026-01-15'),
    });

    subLineRows.push({
      id: `sl_${i}`,
      subscription_id: sId,
      product_id: 'p1',
      variant_id: hasVariant ? 'v1' : null,
      quantity: qty,
      unit_price: unitPrice,
      tax_ids: JSON.stringify(['t1']),
      tax_amount: taxTotal,
      discount_amount: 0,
      amount: subtotal,
      created_at: new Date('2026-01-15'),
      updated_at: new Date('2026-01-15'),
    });

    subHistoryRows.push({
      id: `sh_${i}`,
      subscription_id: sId,
      from_status: 'draft',
      to_status: status,
      changed_by: 'sarah@brightloop.com',
      reason: 'Automated lifecycle progression',
      created_at: new Date('2026-01-15'),
    });
  }

  // Insert in batches of 100 for maximum performance
  for (let i = 0; i < subscriptionRows.length; i += 100) {
    await knex('subscriptions').insert(subscriptionRows.slice(i, i + 100));
    await knex('subscription_lines').insert(subLineRows.slice(i, i + 100));
    await knex('subscription_history').insert(subHistoryRows.slice(i, i + 100));
  }

  // 10. Generate 520 Invoices in mixed statuses (including Overdue)
  console.log('⚡ Generating 520 invoices and lines...');
  const invoiceRows: any[] = [];
  const invLineRows: any[] = [];
  const paymentRows: any[] = [];
  const subInvoiceMonthCount = new Map<string, number>();

  const invoiceStatuses = ['paid', 'confirmed', 'draft', 'cancelled'];
  const paymentMethods = ['bank_transfer', 'card', 'upi', 'cash', 'cheque'];

  for (let i = 1; i <= 520; i++) {
    const invId = `i${i}`;
    const invNum = `INV-2026-${String(i).padStart(5, '0')}`;
    const subIdx = ((i - 1) % 320) + 1;
    const sub = subscriptionRows[subIdx - 1];
    const customerId = sub.customer_id;

    // Ensure completely unique period_start per subscription
    const monthOffset = subInvoiceMonthCount.get(sub.id) || 0;
    subInvoiceMonthCount.set(sub.id, monthOffset + 1);
    const monthNum = (monthOffset % 12) + 1;
    const month = String(monthNum).padStart(2, '0');
    const periodStart = `2026-${month}-01`;
    const periodEnd = `2026-${month}-28`;
    const invoiceDate = periodStart;

    // Some invoices are overdue (dueDate < today e.g. 2026-09-15)
    const isOverdueTarget = i % 5 === 0;
    const dueDate = isOverdueTarget ? '2026-09-15' : '2026-11-20';

    const subtotal = sub.subtotal;
    const taxTotal = sub.tax_total;
    const total = subtotal + taxTotal;

    // Status assignment
    let status: string;
    let amountPaid = 0;
    let balance = total;

    if (isOverdueTarget) {
      status = 'confirmed'; // Overdue confirmed invoice!
      amountPaid = 0;
      balance = total;
    } else {
      status = invoiceStatuses[i % invoiceStatuses.length];
      if (status === 'paid') {
        amountPaid = total;
        balance = 0;
      } else if (status === 'confirmed' && i % 2 === 0) {
        // Partial payment
        amountPaid = Math.round(total / 2);
        balance = total - amountPaid;
      }
    }

    invoiceRows.push({
      id: invId,
      number: invNum,
      status,
      customer_id: customerId,
      subscription_id: sub.id,
      period_start: periodStart,
      period_end: periodEnd,
      invoice_date: invoiceDate,
      due_date: dueDate,
      subtotal,
      tax_total: taxTotal,
      discount_total: 0,
      total,
      amount_paid: amountPaid,
      balance,
      created_at: new Date(invoiceDate),
      updated_at: new Date(invoiceDate),
    });

    invLineRows.push({
      id: `il_${i}`,
      invoice_id: invId,
      product_id: 'p1',
      variant_id: 'v1',
      description: `Brightloop CRM (Odoo) x 50 - Period ${periodStart}`,
      quantity: 50,
      unit_price: 2560.0,
      tax_amount: taxTotal,
      discount_amount: 0,
      amount: subtotal,
      created_at: new Date(invoiceDate),
      updated_at: new Date(invoiceDate),
    });

    // If paid or partial paid, insert a payment record
    if (amountPaid > 0) {
      paymentRows.push({
        id: `pay_${i}`,
        invoice_id: invId,
        method: paymentMethods[i % paymentMethods.length],
        amount: amountPaid,
        date: invoiceDate,
        note: `Payment ref UTR-${100000 + i}`,
        created_at: new Date(invoiceDate),
        updated_at: new Date(invoiceDate),
      });
    }
  }

  // Insert invoices, lines, and payments in batches
  for (let i = 0; i < invoiceRows.length; i += 100) {
    await knex('invoices').insert(invoiceRows.slice(i, i + 100));
    await knex('invoice_lines').insert(invLineRows.slice(i, i + 100));
  }

  for (let i = 0; i < paymentRows.length; i += 100) {
    await knex('payments').insert(paymentRows.slice(i, i + 100));
  }

  console.log(`✅ Seed complete!`);
  console.log(`📊 Summary of generated demo data:`);
  console.log(`   - 1 Admin: admin@brightloop.com (Password: Str0ng!Pass1)`);
  console.log(`   - 2 Staff: sarah@brightloop.com, alex@brightloop.com (Password: Str0ng!Pass1)`);
  console.log(`   - 20 Customers (customer1@shop.com ... customer20@shop.com)`);
  console.log(`   - 5 Products & 4 Variants`);
  console.log(`   - 6 Plans & 1 Quotation Template`);
  console.log(`   - 3 Taxes & 3 Discounts`);
  console.log(`   - ${subscriptionRows.length} Subscriptions`);
  console.log(`   - ${invoiceRows.length} Invoices (including overdue invoices)`);
  console.log(`   - ${paymentRows.length} Payments recorded`);
}

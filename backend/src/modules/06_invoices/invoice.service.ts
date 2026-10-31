import crypto from 'node:crypto';
import { invoiceRepository } from './invoice.repository.js';
import { subscriptionRepository } from '../05_subscriptions/subscription.repository.js';
import { planRepository } from '../04_plans/plan.repository.js';
import { discountService } from '../07_discounts/discount.service.js';
import {
  CreateInvoiceManualDto,
  GenerateInvoicesDto,
  InvoiceQueryDto,
} from './invoice.dto.js';
import { InvoiceResponseDto, InvoiceLine } from './invoice.model.js';
import { AuthenticatedUser } from '../../common/types/index.js';
import { AppError } from '../../common/errors/AppError.js';
import { getDb } from '../../config/database.js';

export class InvoiceService {
  private calculatePeriodEnd(startDate: string, frequency: string): string {
    const d = new Date(startDate);
    switch (frequency) {
      case 'daily':
        d.setDate(d.getDate() + 1);
        break;
      case 'weekly':
        d.setDate(d.getDate() + 7);
        break;
      case 'yearly':
        d.setFullYear(d.getFullYear() + 1);
        break;
      case 'monthly':
      default:
        d.setMonth(d.getMonth() + 1);
        break;
    }
    d.setDate(d.getDate() - 1); // e.g. 2026-11-01 to 2026-11-30
    return d.toISOString().split('T')[0];
  }

  private calculateNextInvoiceDate(periodEnd: string): string {
    const d = new Date(periodEnd);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // Section 12: Idempotent billing day bulk generator
  async generateDueInvoices(dto: GenerateInvoicesDto): Promise<{
    created: number;
    skipped: number;
    invoiceIds: string[];
  }> {
    const asOfDate = dto.asOfDate || new Date().toISOString().split('T')[0];
    const db = getDb();

    // Query active subscriptions whose next_invoice_date is on or before asOfDate
    const dueSubscriptions = await db('subscriptions')
      .where({ status: 'active' })
      .where('next_invoice_date', '<=', asOfDate);

    let created = 0;
    let skipped = 0;
    const invoiceIds: string[] = [];

    for (const sub of dueSubscriptions) {
      const plan = await planRepository.findById(sub.plan_id);
      const periodStart = sub.next_invoice_date;
      const periodEnd = this.calculatePeriodEnd(periodStart, plan?.billing_period || 'monthly');

      // Idempotency check: Ensure the same subscription is never billed twice for the same period
      const existing = await invoiceRepository.findExistingForPeriod(sub.id, periodStart);
      if (existing) {
        skipped++;
        continue;
      }

      // Fetch subscription lines
      const subLines = await db('subscription_lines as sl')
        .leftJoin('products as pr', 'sl.product_id', 'pr.id')
        .leftJoin('product_variants as pv', 'sl.variant_id', 'pv.id')
        .where({ subscription_id: sub.id })
        .select('sl.*', 'pr.name as product_name', 'pv.value as variant_value');

      if (subLines.length === 0) {
        skipped++;
        continue;
      }

      const invoiceId = `i_${crypto.randomUUID().slice(0, 8)}`;
      const invoiceNumber = await invoiceRepository.generateNextNumber();

      let subtotal = 0;
      let taxTotal = 0;
      let totalQty = 0;
      const productIds: string[] = [];
      const invoiceLinesToInsert: Partial<InvoiceLine>[] = [];

      for (const line of subLines) {
        subtotal += Number(line.amount);
        taxTotal += Number(line.tax_amount);
        totalQty += Number(line.quantity);
        productIds.push(line.product_id);

        const desc = line.variant_value
          ? `${line.product_name} (${line.variant_value}) x ${line.quantity}`
          : `${line.product_name} x ${line.quantity}`;

        invoiceLinesToInsert.push({
          id: `il_${crypto.randomUUID().slice(0, 8)}`,
          product_id: line.product_id,
          variant_id: line.variant_id,
          description: desc,
          quantity: Number(line.quantity),
          unit_price: Number(line.unit_price),
          tax_amount: Number(line.tax_amount),
          discount_amount: Number(line.discount_amount || 0),
          amount: Number(line.amount),
        });
      }

      // Automatically evaluate and apply matching discounts from discount rules engine
      const discountEval = await discountService.evaluateDiscountForSubscription(
        sub.id,
        subtotal,
        totalQty,
        productIds
      );
      const discountTotal = discountEval.discountAmount;

      const total = Math.max(0, subtotal + taxTotal - discountTotal);
      const balance = total;

      // Due date calculation: e.g. Net 15 -> +15 days from issue date
      const dueDateObj = new Date(periodStart);
      dueDateObj.setDate(dueDateObj.getDate() + 15);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      await invoiceRepository.create(
        {
          id: invoiceId,
          number: invoiceNumber,
          status: 'confirmed', // Billing day run generates confirmed invoices ready for payment
          customer_id: sub.customer_id,
          subscription_id: sub.id,
          period_start: periodStart,
          period_end: periodEnd,
          invoice_date: periodStart,
          due_date: dueDate,
          subtotal,
          tax_total: taxTotal,
          discount_total: discountTotal,
          total,
          amount_paid: 0,
          balance,
        },
        invoiceLinesToInsert,
        discountEval.appliedDiscountId
      );

      // Advance next_invoice_date on subscription
      const nextDate = this.calculateNextInvoiceDate(periodEnd);
      await db('subscriptions').where({ id: sub.id }).update({
        next_invoice_date: nextDate,
        updated_at: new Date(),
      });

      created++;
      invoiceIds.push(invoiceId);
    }

    return { created, skipped, invoiceIds };
  }

  async createManualInvoice(dto: CreateInvoiceManualDto): Promise<InvoiceResponseDto> {
    const sub = await subscriptionRepository.findById(dto.subscriptionId);
    if (!sub) {
      throw AppError.notFound(`Subscription "${dto.subscriptionId}" not found`);
    }

    const periodStart = dto.periodStart || sub.nextInvoiceDate;
    const periodEnd =
      dto.periodEnd || this.calculatePeriodEnd(periodStart, sub.plan.billingPeriod);

    const existing = await invoiceRepository.findExistingForPeriod(sub.id, periodStart);
    if (existing) {
      throw AppError.conflict(
        `Invoice already exists for subscription "${sub.number}" and period "${periodStart}"`
      );
    }

    const invoiceId = `i_${crypto.randomUUID().slice(0, 8)}`;
    const invoiceNumber = await invoiceRepository.generateNextNumber();

    const invoiceLinesToInsert: Partial<InvoiceLine>[] = sub.lines.map((l) => ({
      id: `il_${crypto.randomUUID().slice(0, 8)}`,
      product_id: l.product.id,
      variant_id: l.variant?.id || null,
      description: l.variant
        ? `${l.product.name} (${l.variant.value}) x ${l.quantity}`
        : `${l.product.name} x ${l.quantity}`,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      tax_amount: l.taxes.reduce((acc, t) => acc + t.amount, 0),
      discount_amount: l.discountAmount,
      amount: l.amount,
    }));

    const dueDateObj = new Date(periodStart);
    dueDateObj.setDate(dueDateObj.getDate() + 15);

    const invoice = await invoiceRepository.create(
      {
        id: invoiceId,
        number: invoiceNumber,
        status: 'draft',
        customer_id: sub.customer.id,
        subscription_id: sub.id,
        period_start: periodStart,
        period_end: periodEnd,
        invoice_date: periodStart,
        due_date: dueDateObj.toISOString().split('T')[0],
        subtotal: sub.subtotal,
        tax_total: sub.taxTotal,
        discount_total: sub.discountTotal,
        total: sub.total,
        amount_paid: 0,
        balance: sub.total,
      },
      invoiceLinesToInsert
    );

    return invoice;
  }

  async confirmInvoice(id: string): Promise<InvoiceResponseDto> {
    const inv = await invoiceRepository.findById(id);
    if (!inv) throw AppError.notFound(`Invoice "${id}" not found`);

    if (inv.status !== 'draft') {
      throw AppError.conflict(`Only draft invoices can be confirmed (current: ${inv.status})`);
    }

    const updated = await invoiceRepository.update(id, { status: 'confirmed' });
    return updated!;
  }

  async cancelInvoice(id: string): Promise<InvoiceResponseDto> {
    const inv = await invoiceRepository.findById(id);
    if (!inv) throw AppError.notFound(`Invoice "${id}" not found`);

    if (inv.payments && inv.payments.length > 0) {
      throw AppError.conflict('Cannot cancel an invoice with recorded payments');
    }

    if (inv.status === 'paid' || inv.status === 'cancelled') {
      throw AppError.conflict(`Cannot cancel invoice currently in "${inv.status}" status`);
    }

    const updated = await invoiceRepository.update(id, { status: 'cancelled' });
    return updated!;
  }

  async sendInvoice(id: string): Promise<{ message: string }> {
    const inv = await invoiceRepository.findById(id);
    if (!inv) throw AppError.notFound(`Invoice "${id}" not found`);

    if (inv.status === 'draft') {
      throw AppError.conflict('Cannot send a draft invoice. Please confirm the invoice first.');
    }

    console.log(`\n📧 [Invoice Dispatched] Invoice ${inv.number} sent to customer ${inv.customer.name}\n`);
    return { message: `Invoice ${inv.number} has been emailed to the customer.` };
  }

  async getInvoicePdf(id: string, currentUser: AuthenticatedUser): Promise<string> {
    const inv = await this.getInvoiceById(id, currentUser);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${inv.number}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .title { font-size: 28px; font-weight: bold; color: #0f172a; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
    .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .table th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 1px solid #cbd5e1; }
    .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .totals { margin-top: 30px; width: 300px; margin-left: auto; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .total-due { font-size: 20px; font-weight: bold; border-top: 2px solid #0f172a; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">BRIGHTLOOP SOFTWARE</div>
      <p>Subscription Billing & Cloud ERP</p>
    </div>
    <div style="text-align: right;">
      <h2>INVOICE: ${inv.number}</h2>
      <p>Issue Date: ${inv.invoiceDate}</p>
      <p>Due Date: ${inv.dueDate}</p>
      <div class="status">${inv.status}</div>
    </div>
  </div>

  <div style="margin-top: 25px;">
    <strong>Billed To:</strong>
    <p>${inv.customer.name}</p>
    <p>Subscription: ${inv.subscription?.number || 'N/A'} (Period: ${inv.periodStart} to ${inv.periodEnd})</p>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price (INR)</th>
        <th>Tax (INR)</th>
        <th>Total (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${inv.lines
        .map(
          (l) => `<tr>
            <td>${l.description}</td>
            <td>${l.quantity}</td>
            <td>${l.unitPrice.toFixed(2)}</td>
            <td>${l.taxAmount.toFixed(2)}</td>
            <td>${l.amount.toFixed(2)}</td>
          </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal:</span><span>₹${inv.subtotal.toFixed(2)}</span></div>
    <div class="totals-row"><span>Tax Total:</span><span>₹${inv.taxTotal.toFixed(2)}</span></div>
    <div class="totals-row"><span>Discount:</span><span>-₹${inv.discountTotal.toFixed(2)}</span></div>
    <div class="totals-row"><span>Total:</span><span>₹${inv.total.toFixed(2)}</span></div>
    <div class="totals-row"><span>Amount Paid:</span><span>₹${inv.amountPaid.toFixed(2)}</span></div>
    <div class="totals-row total-due"><span>Balance Due:</span><span>₹${inv.balance.toFixed(2)}</span></div>
  </div>
</body>
</html>`;
  }

  async getInvoiceById(id: string, currentUser: AuthenticatedUser): Promise<InvoiceResponseDto> {
    const inv = await invoiceRepository.findById(id);
    if (!inv) throw AppError.notFound(`Invoice "${id}" not found`);

    if (currentUser.role === 'customer' && inv.customer.id !== currentUser.customerId) {
      throw AppError.notFound(`Invoice "${id}" not found`);
    }

    return inv;
  }

  async listInvoices(query: InvoiceQueryDto, currentUser: AuthenticatedUser) {
    const filter = { ...query };
    if (currentUser.role === 'customer') {
      filter.customerId = currentUser.customerId;
    }

    const { invoices, total } = await invoiceRepository.findAll(filter);
    return {
      data: invoices,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}

export const invoiceService = new InvoiceService();

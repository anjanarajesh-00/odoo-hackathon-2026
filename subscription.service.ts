import crypto from 'node:crypto';
import { subscriptionRepository } from './subscription.repository.js';
import { planRepository } from '../04_plans/plan.repository.js';
import { productRepository } from '../03_products/product.repository.js';
import { userRepository } from '../02_users/user.repository.js';
import { quotationTemplateRepository } from './quotation_template.repository.js';
import { taxRepository } from '../06_invoices/tax.repository.js';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  TransitionSubscriptionDto,
  RenewSubscriptionDto,
  SubscriptionQueryDto,
} from './subscription.dto.js';
import {
  SubscriptionResponseDto,
  SubscriptionLine,
  SubscriptionStatus,
} from './subscription.model.js';
import { AuthenticatedUser } from '../../common/types/index.js';
import { AppError } from '../../common/errors/AppError.js';

export class SubscriptionService {
  private calculateNextInvoiceDate(startDate: string, billingPeriod: string): string {
    const d = new Date(startDate);
    switch (billingPeriod) {
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
    return d.toISOString().split('T')[0];
  }

  async createSubscription(
    dto: CreateSubscriptionDto,
    currentUser: AuthenticatedUser
  ): Promise<SubscriptionResponseDto> {
    const customer = await userRepository.findCustomerById(dto.customerId);
    if (!customer) {
      throw AppError.notFound(`Customer "${dto.customerId}" not found`);
    }

    const plan = await planRepository.findById(dto.planId);
    if (!plan) {
      throw AppError.notFound(`Plan "${dto.planId}" not found`);
    }

    // Load lines: either explicit or from template
    let lineInputs = dto.lines || [];
    let quotationValidUntil: string | null = null;

    if (dto.templateId) {
      const template = await quotationTemplateRepository.findById(dto.templateId);
      if (template) {
        if (lineInputs.length === 0 && template.lines) {
          try {
            lineInputs = JSON.parse(template.lines);
          } catch (e) {}
        }
        const valDate = new Date(dto.startDate);
        valDate.setDate(valDate.getDate() + Number(template.validity_days));
        quotationValidUntil = valDate.toISOString().split('T')[0];
      }
    }

    if (lineInputs.length === 0) {
      throw AppError.badRequest('At least one product line is required for subscription');
    }

    const taxes = await taxRepository.findAll();
    const taxMap = new Map(taxes.map((t) => [t.id, t]));

    let subtotal = 0;
    let taxTotal = 0;
    const linesToInsert: Partial<SubscriptionLine>[] = [];

    for (const lineInput of lineInputs) {
      const pResult = await productRepository.findProductById(lineInput.productId);
      if (!pResult) {
        throw AppError.notFound(`Product "${lineInput.productId}" not found`);
      }

      let extraPrice = 0;
      if (lineInput.variantId) {
        const v = pResult.variants.find((item) => item.id === lineInput.variantId);
        if (v) extraPrice = Number(v.extra_price);
      }

      const unitPrice = Number(pResult.product.sales_price) + extraPrice;
      const amount = unitPrice * lineInput.quantity;
      subtotal += amount;

      // Taxes for line
      const taxIds = lineInput.taxIds || [];
      let lineTaxAmount = 0;
      for (const tId of taxIds) {
        const t = taxMap.get(tId);
        if (t) {
          lineTaxAmount += (amount * Number(t.rate)) / 100;
        }
      }
      taxTotal += lineTaxAmount;

      linesToInsert.push({
        id: `sl_${crypto.randomUUID().slice(0, 8)}`,
        product_id: lineInput.productId,
        variant_id: lineInput.variantId || null,
        quantity: lineInput.quantity,
        unit_price: unitPrice,
        tax_ids: JSON.stringify(taxIds),
        tax_amount: lineTaxAmount,
        discount_amount: 0,
        amount,
      });
    }

    const total = subtotal + taxTotal;
    const number = await subscriptionRepository.generateNextNumber();
    const nextInvoiceDate = this.calculateNextInvoiceDate(dto.startDate, plan.billing_period);

    const subscription = await subscriptionRepository.create(
      {
        id: `s_${crypto.randomUUID().slice(0, 8)}`,
        number,
        status: dto.templateId ? 'quotation' : 'draft',
        customer_id: dto.customerId,
        plan_id: dto.planId,
        start_date: dto.startDate,
        expiry_date: dto.expiryDate || null,
        quotation_valid_until: quotationValidUntil,
        next_invoice_date: nextInvoiceDate,
        payment_terms: dto.paymentTerms,
        subtotal,
        tax_total: taxTotal,
        discount_total: 0,
        total,
      },
      linesToInsert,
      currentUser.email
    );

    return subscription;
  }

  async updateSubscription(
    id: string,
    dto: UpdateSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const existing = await subscriptionRepository.findById(id);
    if (!existing) throw AppError.notFound(`Subscription "${id}" not found`);

    if (existing.status !== 'draft' && existing.status !== 'quotation') {
      throw AppError.conflict(
        `Subscriptions can only be edited while in 'draft' or 'quotation' status (current: ${existing.status})`
      );
    }

    const payload: any = {};
    if (dto.planId) payload.plan_id = dto.planId;
    if (dto.startDate) payload.start_date = dto.startDate;
    if (dto.expiryDate !== undefined) payload.expiry_date = dto.expiryDate;
    if (dto.paymentTerms) payload.payment_terms = dto.paymentTerms;

    let linesToInsert: Partial<SubscriptionLine>[] | undefined = undefined;
    if (dto.lines) {
      const taxes = await taxRepository.findAll();
      const taxMap = new Map(taxes.map((t) => [t.id, t]));
      let subtotal = 0;
      let taxTotal = 0;
      linesToInsert = [];

      for (const lineInput of dto.lines) {
        const pResult = await productRepository.findProductById(lineInput.productId);
        if (!pResult) throw AppError.notFound(`Product "${lineInput.productId}" not found`);

        let extraPrice = 0;
        if (lineInput.variantId) {
          const v = pResult.variants.find((item) => item.id === lineInput.variantId);
          if (v) extraPrice = Number(v.extra_price);
        }

        const unitPrice = Number(pResult.product.sales_price) + extraPrice;
        const amount = unitPrice * lineInput.quantity;
        subtotal += amount;

        const taxIds = lineInput.taxIds || [];
        let lineTaxAmount = 0;
        for (const tId of taxIds) {
          const t = taxMap.get(tId);
          if (t) lineTaxAmount += (amount * Number(t.rate)) / 100;
        }
        taxTotal += lineTaxAmount;

        linesToInsert.push({
          id: `sl_${crypto.randomUUID().slice(0, 8)}`,
          product_id: lineInput.productId,
          variant_id: lineInput.variantId || null,
          quantity: lineInput.quantity,
          unit_price: unitPrice,
          tax_ids: JSON.stringify(taxIds),
          tax_amount: lineTaxAmount,
          discount_amount: 0,
          amount,
        });
      }

      payload.subtotal = subtotal;
      payload.tax_total = taxTotal;
      payload.total = subtotal + taxTotal;
    }

    const updated = await subscriptionRepository.update(id, payload, linesToInsert);
    return updated!;
  }

  // State transitions: draft -> quotation -> confirmed -> active -> closed
  async transition(
    id: string,
    dto: TransitionSubscriptionDto,
    currentUser: AuthenticatedUser
  ): Promise<SubscriptionResponseDto> {
    const sub = await subscriptionRepository.findById(id);
    if (!sub) throw AppError.notFound(`Subscription "${id}" not found`);

    const fromStatus = sub.status;
    const toStatus = dto.to;

    if (fromStatus === toStatus) return sub;

    // Allowed transition validation from Section 11:
    // draft -> quotation -> confirmed -> active -> closed. Closing also allowed from confirmed.
    const valid =
      (fromStatus === 'draft' && toStatus === 'quotation') ||
      (fromStatus === 'quotation' && toStatus === 'confirmed') ||
      (fromStatus === 'confirmed' && toStatus === 'active') ||
      (fromStatus === 'confirmed' && toStatus === 'closed') ||
      (fromStatus === 'active' && toStatus === 'closed') ||
      (fromStatus === 'draft' && toStatus === 'closed');

    if (!valid) {
      throw AppError.conflict(
        `Invalid status transition from "${fromStatus}" to "${toStatus}". Allowed path: draft → quotation → confirmed → active → closed`
      );
    }

    await subscriptionRepository.recordTransition(
      id,
      fromStatus,
      toStatus,
      currentUser.email,
      dto.reason
    );

    return (await subscriptionRepository.findById(id))!;
  }

  async renew(
    id: string,
    dto: RenewSubscriptionDto,
    currentUser: AuthenticatedUser
  ): Promise<SubscriptionResponseDto> {
    const sub = await subscriptionRepository.findById(id);
    if (!sub) throw AppError.notFound(`Subscription "${id}" not found`);

    if (sub.status !== 'active') {
      throw AppError.conflict(`Only active subscriptions can be renewed (current: ${sub.status})`);
    }

    const plan = await planRepository.findById(sub.plan.id);
    if (plan && !plan.allow_renew) {
      throw AppError.conflict('This subscription plan policy does not permit renewal (allowRenew is false)');
    }

    const payload: any = {};
    if (dto.expiryDate) {
      payload.expiry_date = dto.expiryDate;
    } else {
      // Extend by 1 cycle
      const currentExpiry = sub.expiryDate || sub.startDate;
      payload.expiry_date = this.calculateNextInvoiceDate(currentExpiry, sub.plan.billingPeriod);
    }

    await subscriptionRepository.update(id, payload);
    await subscriptionRepository.recordTransition(
      id,
      sub.status,
      'active',
      currentUser.email,
      'Subscription renewed'
    );

    return (await subscriptionRepository.findById(id))!;
  }

  async getById(id: string, currentUser: AuthenticatedUser): Promise<SubscriptionResponseDto> {
    const sub = await subscriptionRepository.findById(id);
    if (!sub) throw AppError.notFound(`Subscription "${id}" not found`);

    // Section 15: A customer requesting another customer's record gets 404 (not 403)
    if (currentUser.role === 'customer' && sub.customer.id !== currentUser.customerId) {
      throw AppError.notFound(`Subscription "${id}" not found`);
    }

    return sub;
  }

  async list(query: SubscriptionQueryDto, currentUser: AuthenticatedUser) {
    const filter = { ...query };
    // Section 15: Customers filter by own customerId automatically
    if (currentUser.role === 'customer') {
      filter.customerId = currentUser.customerId;
    }

    const { subscriptions, total } = await subscriptionRepository.findAll(filter);
    return {
      data: subscriptions,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getHistory(id: string) {
    const history = await subscriptionRepository.getHistory(id);
    return history.map((h) => ({
      id: h.id,
      fromStatus: h.from_status,
      toStatus: h.to_status,
      changedBy: h.changed_by || null,
      reason: h.reason || null,
      createdAt: h.created_at.toISOString(),
    }));
  }
}

export const subscriptionService = new SubscriptionService();

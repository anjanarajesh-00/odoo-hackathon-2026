import crypto from 'node:crypto';
import { paymentRepository } from './payment.repository.js';
import { invoiceRepository } from '../06_invoices/invoice.repository.js';
import { RecordPaymentDto, PaymentQueryDto } from './payment.dto.js';
import {
  PaymentResponseDto,
  RecordPaymentResultDto,
  formatPaymentResponse,
} from './payment.model.js';
import { AuthenticatedUser } from '../../common/types/index.js';
import { AppError } from '../../common/errors/AppError.js';

export class PaymentService {
  async recordPayment(
    invoiceId: string,
    dto: RecordPaymentDto
  ): Promise<RecordPaymentResultDto> {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw AppError.notFound(`Invoice "${invoiceId}" not found`);
    }

    if (invoice.status !== 'confirmed') {
      throw AppError.conflict(
        `Payments can only be recorded against 'confirmed' invoices (current status: ${invoice.status})`
      );
    }

    if (dto.amount > invoice.balance) {
      throw AppError.badRequest(
        `Payment amount (₹${dto.amount}) exceeds invoice outstanding balance (₹${invoice.balance})`
      );
    }

    const newAmountPaid = invoice.amountPaid + dto.amount;
    const newBalance = Math.max(0, invoice.balance - dto.amount);
    const newStatus = newBalance <= 0 ? 'paid' : 'confirmed';

    const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;

    const result = await paymentRepository.recordPayment(
      {
        id: paymentId,
        invoice_id: invoiceId,
        method: dto.method,
        amount: dto.amount,
        date: dto.date,
        note: dto.note?.trim() || null,
      },
      newAmountPaid,
      newBalance,
      newStatus
    );

    return {
      payment: formatPaymentResponse(result.payment),
      invoice: result.invoice,
    };
  }

  async getPayment(id: string): Promise<PaymentResponseDto> {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw AppError.notFound(`Payment "${id}" not found`);
    return formatPaymentResponse(payment);
  }

  async listPayments(query: PaymentQueryDto, currentUser: AuthenticatedUser) {
    const filter: any = { ...query };
    if (currentUser.role === 'customer') {
      filter.customerId = currentUser.customerId;
    }

    const { payments, total, totalAmount } = await paymentRepository.findAll(filter);
    return {
      data: payments.map((p: any) => ({
        id: p.id,
        invoiceId: p.invoice_id,
        invoice: {
          id: p.invoice_id,
          number: p.invoice_number || p.invoice_id,
        },
        customer: {
          id: p.customer_id || p.invoice_customer_id || '',
          name: p.customer_name || 'Customer',
        },
        method: p.method,
        amount: Number(p.amount),
        date: p.date,
        note: p.note || null,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : '',
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
      summary: {
        count: total,
        totalAmount: Math.round(totalAmount * 100) / 100,
      },
    };
  }
}

export const paymentService = new PaymentService();

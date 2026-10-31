import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { testDatabaseConnection } from './config/database.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { AppError } from './common/errors/AppError.js';

// Contract v0.1 Routers
import authRouter from './modules/01_auth/auth.routes.js';
import userRouter from './modules/02_users/user.routes.js';
import customerRouter from './modules/02_users/customer.routes.js';
import productRouter from './modules/03_products/product.routes.js';
import planRouter from './modules/04_plans/plan.routes.js';
import quotationTemplateRouter from './modules/05_subscriptions/quotation_template.routes.js';
import taxRouter from './modules/06_invoices/tax.routes.js';
import discountRouter from './modules/07_discounts/discount.routes.js';
import subscriptionRouter from './modules/05_subscriptions/subscription.routes.js';
import invoiceRouter from './modules/06_invoices/invoice.routes.js';
import paymentRouter from './modules/08_payments/payment.routes.js';
import reportingRouter from './modules/09_reporting/reporting.routes.js';

export const createApp = (): Application => {
  const app = express();

  // Standard Middlewares & CORS configured for Frontend (Contract v0.1 Section 1)
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health Check Endpoint
  app.get('/api/health', async (_req: Request, res: Response) => {
    const dbStatus = await testDatabaseConnection();
    res.status(dbStatus.connected ? 200 : 503).json({
      status: dbStatus.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Brightloop Subscription Management Backend',
      database: {
        type: env.DATABASE_TYPE,
        connected: dbStatus.connected,
        latencyMs: dbStatus.latencyMs,
        message: dbStatus.message,
      },
    });
  });

  // Base API Info
  app.get('/api/v1', (_req: Request, res: Response) => {
    res.json({
      message: 'Brightloop Subscription Management API v0.1',
      databaseType: env.DATABASE_TYPE,
      docs: '/api/docs',
    });
  });

  // All 12 Contract Routers Mounted Under /api/v1
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/customers', customerRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/plans', planRouter);
  app.use('/api/v1/quotation-templates', quotationTemplateRouter);
  app.use('/api/v1/taxes', taxRouter);
  app.use('/api/v1/discounts', discountRouter);
  app.use('/api/v1/subscriptions', subscriptionRouter);
  app.use('/api/v1/invoices', invoiceRouter);
  app.use('/api/v1/payments', paymentRouter);
  app.use('/api/v1/dashboard', reportingRouter);

  // 404 Not Found Catch-All
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound('Requested route does not exist'));
  });

  // Centralized Error Handler (formatting 422 with field-level errors as per contract)
  app.use(errorHandler);

  return app;
};

export default createApp;

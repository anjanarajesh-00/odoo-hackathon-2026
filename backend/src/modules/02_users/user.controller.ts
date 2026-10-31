import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import {
  createStaffSchema,
  updateUserSchema,
  userQuerySchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from './user.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class UserController {
  // --- Users & Staff ---
  async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createStaffSchema.parse(req.body);
      const user = await userService.createStaff(validated);
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = userQuerySchema.parse(req.query);
      const result = await userService.listUsers(query);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateUserSchema.parse(req.body);
      const user = await userService.updateUser(req.params.id, validated);
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.deactivateUser(req.params.id);
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  // --- Customers ---
  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createCustomerSchema.parse(req.body);
      const customer = await userService.createCustomer(validated);
      sendSuccess(res, customer, 201);
    } catch (error) {
      next(error);
    }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await userService.getCustomer(req.params.id);
      sendSuccess(res, customer, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateCustomerSchema.parse(req.body);
      const customer = await userService.updateCustomer(req.params.id, validated);
      sendSuccess(res, customer, 200);
    } catch (error) {
      next(error);
    }
  }

  async listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = customerQuerySchema.parse(req.query);
      const result = await userService.listCustomers(query);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

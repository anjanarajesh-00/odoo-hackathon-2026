import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from './product.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await productService.listProducts(query);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProduct(req.params.id);
      sendSuccess(res, product, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await productService.createProduct(validated);
      sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateProductSchema.parse(req.body);
      const product = await productService.updateProduct(req.params.id, validated);
      sendSuccess(res, product, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();

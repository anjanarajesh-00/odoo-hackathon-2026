import crypto from 'node:crypto';
import { IProductRepository, productRepository } from './product.repository.js';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './product.dto.js';
import { ProductResponseDto, formatProductResponse } from './product.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class ProductService {
  constructor(private repo: IProductRepository = productRepository) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    const productId = `p_${crypto.randomUUID().slice(0, 8)}`;
    const variants = (dto.variants || []).map((v) => ({
      id: v.id || `v_${crypto.randomUUID().slice(0, 8)}`,
      attribute: v.attribute,
      value: v.value,
      extra_price: v.extraPrice,
    }));

    const result = await this.repo.createProduct(
      {
        id: productId,
        name: dto.name.trim(),
        type: dto.type,
        sales_price: dto.salesPrice,
        cost_price: dto.costPrice,
        notes: dto.notes?.trim() || null,
        is_active: true,
      },
      variants
    );

    return formatProductResponse(result.product, result.variants);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const existing = await this.repo.findProductById(id);
    if (!existing) {
      throw AppError.notFound(`Product "${id}" not found`);
    }

    const updatePayload: any = {};
    if (dto.name !== undefined) updatePayload.name = dto.name.trim();
    if (dto.type !== undefined) updatePayload.type = dto.type;
    if (dto.salesPrice !== undefined) updatePayload.sales_price = dto.salesPrice;
    if (dto.costPrice !== undefined) updatePayload.cost_price = dto.costPrice;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes?.trim() || null;

    let variantRows = undefined;
    if (dto.variants !== undefined) {
      variantRows = dto.variants.map((v) => ({
        id: v.id || `v_${crypto.randomUUID().slice(0, 8)}`,
        attribute: v.attribute,
        value: v.value,
        extra_price: v.extraPrice,
      }));
    }

    const updated = await this.repo.updateProduct(id, updatePayload, variantRows);
    return formatProductResponse(updated!.product, updated!.variants);
  }

  async getProduct(id: string): Promise<ProductResponseDto> {
    const result = await this.repo.findProductById(id);
    if (!result) {
      throw AppError.notFound(`Product "${id}" not found`);
    }
    return formatProductResponse(result.product, result.variants);
  }

  async listProducts(query: ProductQueryDto) {
    const { products, total } = await this.repo.findAllProducts(query);
    return {
      data: products.map((p) => formatProductResponse(p.product, p.variants)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async deleteProduct(id: string): Promise<void> {
    const existing = await this.repo.findProductById(id);
    if (!existing) {
      throw AppError.notFound(`Product "${id}" not found`);
    }
    await this.repo.deleteProduct(id);
  }

  async calculateEffectivePrice(
    productId: string,
    variantId?: string | null
  ): Promise<{ basePrice: number; extraPrice: number; effectivePrice: number; name: string }> {
    const result = await this.repo.findProductById(productId);
    if (!result) {
      throw AppError.notFound(`Product "${productId}" not found`);
    }

    let extraPrice = 0;
    if (variantId) {
      const v = result.variants.find((item) => item.id === variantId);
      if (!v) {
        throw AppError.badRequest(`Variant "${variantId}" does not belong to product "${productId}"`);
      }
      extraPrice = Number(v.extra_price);
    }

    const basePrice = Number(result.product.sales_price);
    return {
      basePrice,
      extraPrice,
      effectivePrice: basePrice + extraPrice,
      name: result.product.name,
    };
  }
}

export const productService = new ProductService();

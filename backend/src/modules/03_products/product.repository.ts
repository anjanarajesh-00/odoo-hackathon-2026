import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { Product, ProductVariant } from './product.model.js';

export interface IProductRepository {
  createProduct(product: Partial<Product>, variants?: Partial<ProductVariant>[]): Promise<{ product: Product; variants: ProductVariant[] }>;
  updateProduct(id: string, product: Partial<Product>, variants?: Partial<ProductVariant>[]): Promise<{ product: Product; variants: ProductVariant[] } | null>;
  findProductById(id: string): Promise<{ product: Product; variants: ProductVariant[] } | null>;
  findAllProducts(filter?: {
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: { product: Product; variants: ProductVariant[] }[]; total: number }>;
  deleteProduct(id: string): Promise<boolean>;
  findVariantById(variantId: string): Promise<ProductVariant | null>;
}

export class KnexProductRepository implements IProductRepository {
  private get db(): Knex {
    return getDb();
  }

  async createProduct(
    product: Partial<Product>,
    variants: Partial<ProductVariant>[] = []
  ): Promise<{ product: Product; variants: ProductVariant[] }> {
    const trx = await this.db.transaction();
    try {
      await trx('products').insert({
        ...product,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (variants.length > 0) {
        const variantRows = variants.map((v) => ({
          ...v,
          product_id: product.id,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await trx('product_variants').insert(variantRows);
      }

      await trx.commit();
      return (await this.findProductById(product.id!))!;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updateProduct(
    id: string,
    product: Partial<Product>,
    variants?: Partial<ProductVariant>[]
  ): Promise<{ product: Product; variants: ProductVariant[] } | null> {
    const trx = await this.db.transaction();
    try {
      if (Object.keys(product).length > 0) {
        await trx('products')
          .where({ id })
          .update({
            ...product,
            updated_at: new Date(),
          });
      }

      if (variants !== undefined) {
        // Contract v0.1: variants replaced with the array sent
        await trx('product_variants').where({ product_id: id }).del();
        if (variants.length > 0) {
          const variantRows = variants.map((v) => ({
            ...v,
            product_id: id,
            created_at: new Date(),
            updated_at: new Date(),
          }));
          await trx('product_variants').insert(variantRows);
        }
      }

      await trx.commit();
      return this.findProductById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async findProductById(id: string): Promise<{ product: Product; variants: ProductVariant[] } | null> {
    const product = await this.db('products').where({ id }).first();
    if (!product) return null;

    const variants = await this.db('product_variants').where({ product_id: id });
    return { product, variants };
  }

  async findAllProducts(filter?: {
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: { product: Product; variants: ProductVariant[] }[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;

    let query = this.db('products').where({ is_active: true });

    if (filter?.type) {
      query = query.where({ type: filter.type });
    }

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.where((q) => {
        q.whereRaw('LOWER(name) LIKE ?', [term]).orWhereRaw('LOWER(notes) LIKE ?', [term]);
      });
    }

    const countResult = await query.clone().count<{ count: string | number }>('id as count').first();
    const total = Number(countResult?.count || 0);

    const rows = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    const products = await Promise.all(
      rows.map(async (p) => {
        const variants = await this.db('product_variants').where({ product_id: p.id });
        return { product: p, variants };
      })
    );

    return { products, total };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const count = await this.db('products').where({ id }).update({ is_active: false });
    return count > 0;
  }

  async findVariantById(variantId: string): Promise<ProductVariant | null> {
    const row = await this.db('product_variants').where({ id: variantId }).first();
    return row || null;
  }
}

export const productRepository = new KnexProductRepository();

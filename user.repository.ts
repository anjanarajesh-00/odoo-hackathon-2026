import { Knex } from 'knex';
import { getDb } from '../../config/database.js';
import { User, Customer } from './user.model.js';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User | null>;
  findAll(filter?: {
    role?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ users: User[]; total: number }>;

  // Customers
  findCustomerById(id: string): Promise<Customer | null>;
  findCustomerByUserId(userId: string): Promise<Customer | null>;
  findCustomerByEmail(email: string): Promise<Customer | null>;
  createCustomer(customerData: Partial<Customer>): Promise<Customer>;
  updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | null>;
  findAllCustomers(filter?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ customers: Customer[]; total: number }>;
}

export class KnexUserRepository implements IUserRepository {
  private get db(): Knex {
    return getDb();
  }

  // --- Users ---
  async findById(id: string): Promise<User | null> {
    const row = await this.db('users').where({ id }).first();
    return row || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db('users')
      .whereRaw('LOWER(email) = ?', [email.trim().toLowerCase()])
      .first();
    return row || null;
  }

  async create(userData: Partial<User>): Promise<User> {
    await this.db('users').insert({
      ...userData,
      email: userData.email?.toLowerCase().trim(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    const created = await this.findById(userData.id!);
    return created!;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.db('users')
      .where({ id })
      .update({
        ...userData,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async findAll(filter?: {
    role?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ users: User[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;

    let query = this.db('users');

    if (filter?.role) {
      query = query.where({ role: filter.role.toLowerCase() });
    }

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.where((q) => {
        q.whereRaw('LOWER(name) LIKE ?', [term]).orWhereRaw('LOWER(email) LIKE ?', [term]);
      });
    }

    const countResult = await query.clone().count<{ count: string | number }>('id as count').first();
    const total = Number(countResult?.count || 0);

    const users = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    return { users, total };
  }

  // --- Customers ---
  async findCustomerById(id: string): Promise<Customer | null> {
    const row = await this.db('customers').where({ id }).first();
    return row || null;
  }

  async findCustomerByUserId(userId: string): Promise<Customer | null> {
    const row = await this.db('customers').where({ user_id: userId }).first();
    return row || null;
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    const row = await this.db('customers')
      .whereRaw('LOWER(email) = ?', [email.trim().toLowerCase()])
      .first();
    return row || null;
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    await this.db('customers').insert({
      ...customerData,
      email: customerData.email?.toLowerCase().trim(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    const created = await this.findCustomerById(customerData.id!);
    return created!;
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | null> {
    await this.db('customers')
      .where({ id })
      .update({
        ...customerData,
        updated_at: new Date(),
      });
    return this.findCustomerById(id);
  }

  async findAllCustomers(filter?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const offset = (page - 1) * pageSize;

    let query = this.db('customers');

    if (filter?.search) {
      const term = `%${filter.search.toLowerCase()}%`;
      query = query.where((q) => {
        q.whereRaw('LOWER(name) LIKE ?', [term])
          .orWhereRaw('LOWER(email) LIKE ?', [term])
          .orWhereRaw('LOWER(company) LIKE ?', [term]);
      });
    }

    const countResult = await query.clone().count<{ count: string | number }>('id as count').first();
    const total = Number(countResult?.count || 0);

    const customers = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    return { customers, total };
  }
}

export const userRepository = new KnexUserRepository();

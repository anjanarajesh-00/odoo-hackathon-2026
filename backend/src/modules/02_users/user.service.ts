import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { IUserRepository, userRepository } from './user.repository.js';
import {
  CreateStaffDto,
  UpdateUserDto,
  UserQueryDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryDto,
} from './user.dto.js';
import {
  UserResponseDto,
  CustomerResponseDto,
  formatUserResponse,
  formatCustomerResponse,
} from './user.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class UserService {
  constructor(private userRepo: IUserRepository = userRepository) {}

  // --- Users & Staff ---
  async createStaff(dto: CreateStaffDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError('Email already registered', 409, { email: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = await this.userRepo.create({
      id: `u_${crypto.randomUUID().slice(0, 8)}`,
      email: dto.email.toLowerCase().trim(),
      password_hash,
      name: dto.name.trim(),
      role: 'staff',
      is_active: true,
    });

    return formatUserResponse(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw AppError.notFound(`User "${id}" not found`);
    }

    const updatePayload: any = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.isActive !== undefined) updatePayload.is_active = dto.isActive;

    const updated = await this.userRepo.update(id, updatePayload);
    return formatUserResponse(updated!);
  }

  async deactivateUser(id: string): Promise<UserResponseDto> {
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw AppError.notFound(`User "${id}" not found`);
    }
    if (existing.role === 'admin') {
      throw AppError.badRequest('Cannot deactivate super admin user');
    }

    const updated = await this.userRepo.update(id, { is_active: false });
    return formatUserResponse(updated!);
  }

  async listUsers(query: UserQueryDto) {
    const { users, total } = await this.userRepo.findAll(query);
    return {
      data: users.map((u) => formatUserResponse(u)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  // --- Customers ---
  async createCustomer(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.userRepo.findCustomerByEmail(dto.email);
    if (existing) {
      throw new AppError('Customer with this email already exists', 409, {
        email: 'Customer email already registered',
      });
    }

    const customer = await this.userRepo.createCustomer({
      id: `c_${crypto.randomUUID().slice(0, 8)}`,
      name: dto.name.trim(),
      company: dto.company?.trim() || null,
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone?.trim() || null,
      address: dto.address?.trim() || null,
    });

    return formatCustomerResponse(customer);
  }

  async getCustomer(id: string): Promise<CustomerResponseDto> {
    const customer = await this.userRepo.findCustomerById(id);
    if (!customer) {
      throw AppError.notFound(`Customer "${id}" not found`);
    }
    return formatCustomerResponse(customer);
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.userRepo.findCustomerById(id);
    if (!existing) {
      throw AppError.notFound(`Customer "${id}" not found`);
    }

    const updated = await this.userRepo.updateCustomer(id, {
      ...dto,
      name: dto.name ? dto.name.trim() : existing.name,
      email: dto.email ? dto.email.toLowerCase().trim() : existing.email,
    });

    return formatCustomerResponse(updated!);
  }

  async listCustomers(query: CustomerQueryDto) {
    const { customers, total } = await this.userRepo.findAllCustomers(query);
    return {
      data: customers.map(formatCustomerResponse),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}

export const userService = new UserService();

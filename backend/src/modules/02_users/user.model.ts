import { UserRole } from '../../common/types/index.js';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  user_id?: string | null;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customerId?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CustomerResponseDto {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
}

export const formatUserResponse = (user: User, customerId?: string): UserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  customerId: customerId || undefined,
  isActive: user.is_active,
  createdAt: user.created_at ? new Date(user.created_at).toISOString() : undefined,
});

export const formatCustomerResponse = (c: Customer): CustomerResponseDto => ({
  id: c.id,
  name: c.name,
  company: c.company || null,
  email: c.email,
  phone: c.phone || null,
  address: c.address || null,
  createdAt: new Date(c.created_at).toISOString(),
});

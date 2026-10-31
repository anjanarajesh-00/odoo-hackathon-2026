import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { env } from '../../../config/env.js';
import { AppError } from '../../../common/errors/AppError.js';
import { AuthenticatedUser } from '../../../common/types/index.js';
import { IAuthProvider, SignupInput, AuthResult } from './IAuthProvider.js';
import { IUserRepository, userRepository } from '../../02_users/user.repository.js';
import { formatUserResponse } from '../../02_users/user.model.js';
import { LocalJwtAuthProvider } from './LocalJwtAuthProvider.js';

export class SupabaseAuthProvider implements IAuthProvider {
  private supabase: SupabaseClient | null = null;
  private fallbackProvider: LocalJwtAuthProvider;

  constructor(private userRepo: IUserRepository = userRepository) {
    this.fallbackProvider = new LocalJwtAuthProvider(userRepo);
    if (env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY)) {
      this.supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY!
      );
    }
  }

  async signup(input: SignupInput): Promise<AuthResult> {
    if (!this.supabase) {
      return this.fallbackProvider.signup(input);
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: input.email.toLowerCase().trim(),
      password: input.password,
      options: {
        data: {
          name: input.name,
          role: 'customer',
        },
      },
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    const userId = data.user?.id || `u_${crypto.randomUUID().slice(0, 8)}`;
    const customerId = `c_${crypto.randomUUID().slice(0, 8)}`;

    let user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      user = await this.userRepo.create({
        id: userId,
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        role: 'customer',
        is_active: true,
      });

      await this.userRepo.createCustomer({
        id: customerId,
        user_id: user.id,
        name: input.name.trim(),
        company: input.company?.trim() || null,
        email: input.email.toLowerCase().trim(),
        phone: input.phone?.trim() || null,
      });
    }

    return {
      token: data.session?.access_token || '',
      user: formatUserResponse(user, customerId),
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (!this.supabase) {
      return this.fallbackProvider.login(email, password);
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return this.fallbackProvider.login(email, password);
    }

    let user = await this.userRepo.findByEmail(email);
    let customerId: string | undefined;

    if (!user) {
      user = await this.userRepo.create({
        id: data.user.id,
        email: data.user.email || email,
        name: (data.user.user_metadata?.name as string) || 'Customer',
        role: 'customer',
        is_active: true,
      });
      const customer = await this.userRepo.createCustomer({
        id: `c_${crypto.randomUUID().slice(0, 8)}`,
        user_id: user.id,
        name: user.name,
        email: user.email,
      });
      customerId = customer.id;
    } else if (user.role === 'customer') {
      const customer = await this.userRepo.findCustomerByUserId(user.id);
      customerId = customer?.id;
    }

    return {
      token: data.session.access_token,
      user: formatUserResponse(user, customerId),
    };
  }

  async verifyToken(token: string): Promise<AuthenticatedUser> {
    if (!this.supabase) {
      return this.fallbackProvider.verifyToken(token);
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      return this.fallbackProvider.verifyToken(token);
    }

    let user = await this.userRepo.findById(data.user.id);
    if (!user && data.user.email) {
      user = await this.userRepo.findByEmail(data.user.email);
    }

    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    let customerId: string | undefined;
    if (user.role === 'customer') {
      const customer = await this.userRepo.findCustomerByUserId(user.id);
      customerId = customer?.id;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerId,
    };
  }

  async requestPasswordReset(email: string): Promise<{ resetToken?: string; message: string }> {
    if (!this.supabase) {
      return this.fallbackProvider.requestPasswordReset(email);
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    });
    if (error) {
      return this.fallbackProvider.requestPasswordReset(email);
    }

    return {
      message: 'If that email exists in our system, a password reset link has been dispatched.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.fallbackProvider.resetPassword(token, newPassword);
  }
}

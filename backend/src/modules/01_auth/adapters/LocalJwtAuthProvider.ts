import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import { AppError } from '../../../common/errors/AppError.js';
import { AuthenticatedUser, UserRole } from '../../../common/types/index.js';
import { IAuthProvider, SignupInput, AuthResult } from './IAuthProvider.js';
import { IUserRepository, userRepository } from '../../02_users/user.repository.js';
import { formatUserResponse } from '../../02_users/user.model.js';

export class LocalJwtAuthProvider implements IAuthProvider {
  constructor(private userRepo: IUserRepository = userRepository) {}

  private generateToken(payload: {
    id: string;
    email: string;
    role: UserRole;
    customerId?: string;
  }): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  async signup(input: SignupInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 409, { email: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(input.password, salt);

    const userId = `u_${crypto.randomUUID().slice(0, 8)}`;
    const customerId = `c_${crypto.randomUUID().slice(0, 8)}`;

    const user = await this.userRepo.create({
      id: userId,
      email: input.email.toLowerCase().trim(),
      password_hash,
      name: input.name.trim(),
      role: 'customer',
      is_active: true,
    });

    const customer = await this.userRepo.createCustomer({
      id: customerId,
      user_id: user.id,
      name: input.name.trim(),
      company: input.company?.trim() || null,
      email: input.email.toLowerCase().trim(),
      phone: input.phone?.trim() || null,
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: 'customer',
      customerId: customer.id,
    });

    return { token, user: formatUserResponse(user, customer.id) };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.password_hash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.is_active) {
      throw AppError.forbidden('This account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    let customerId: string | undefined;
    if (user.role === 'customer') {
      const customer = await this.userRepo.findCustomerByUserId(user.id);
      customerId = customer?.id;
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      customerId,
    });

    return { token, user: formatUserResponse(user, customerId) };
  }

  async verifyToken(token: string): Promise<AuthenticatedUser> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        email: string;
        role: UserRole;
        customerId?: string;
      };

      const user = await this.userRepo.findById(decoded.id);
      if (!user || !user.is_active) {
        throw AppError.unauthorized('User not found or deactivated');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        customerId: decoded.customerId,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw AppError.unauthorized('Missing or expired token');
    }
  }

  async requestPasswordReset(email: string): Promise<{ resetToken?: string; message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Do not reveal whether email exists
      return {
        message: 'If that email exists in our system, a password reset link has been dispatched.',
      };
    }

    const resetToken = jwt.sign(
      { id: user.id, purpose: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log(`\n🔑 [Password Reset Link] For ${user.email}:\n🔗 ${resetLink}\n`);

    return {
      resetToken,
      message: 'If that email exists in our system, a password reset link has been dispatched.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        purpose: string;
      };

      if (decoded.purpose !== 'password_reset') {
        throw AppError.badRequest('Invalid reset token purpose');
      }

      const user = await this.userRepo.findById(decoded.id);
      if (!user) {
        throw AppError.notFound('User not found');
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      await this.userRepo.update(user.id, { password_hash });

      return { message: 'Password has been successfully updated.' };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw AppError.badRequest('Invalid or expired reset token');
    }
  }
}

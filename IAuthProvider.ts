import { UserResponseDto } from '../../02_users/user.model.js';
import { AuthenticatedUser } from '../../../common/types/index.js';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

export interface AuthResult {
  token: string;
  user: UserResponseDto;
}

export interface IAuthProvider {
  signup(input: SignupInput): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  verifyToken(token: string): Promise<AuthenticatedUser>;
  requestPasswordReset(email: string): Promise<{ resetToken?: string; message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
}

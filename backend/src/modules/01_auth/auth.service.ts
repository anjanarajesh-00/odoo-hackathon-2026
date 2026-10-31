import { getAuthProvider, IAuthProvider } from './adapters/index.js';
import { SignupDto, LoginDto } from './auth.dto.js';

export class AuthService {
  private get provider(): IAuthProvider {
    return getAuthProvider();
  }

  async signup(dto: SignupDto) {
    return this.provider.signup(dto);
  }

  async login(dto: LoginDto) {
    return this.provider.login(dto.email, dto.password);
  }

  async requestPasswordReset(email: string) {
    return this.provider.requestPasswordReset(email);
  }

  async resetPassword(token: string, password: string) {
    return this.provider.resetPassword(token, password);
  }
}

export const authService = new AuthService();

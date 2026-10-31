import { env } from '../../../config/env.js';
import { IAuthProvider } from './IAuthProvider.js';
import { LocalJwtAuthProvider } from './LocalJwtAuthProvider.js';
import { SupabaseAuthProvider } from './SupabaseAuthProvider.js';

let authProviderInstance: IAuthProvider | null = null;

export const getAuthProvider = (): IAuthProvider => {
  if (!authProviderInstance) {
    if (env.DATABASE_TYPE === 'supabase') {
      authProviderInstance = new SupabaseAuthProvider();
    } else {
      authProviderInstance = new LocalJwtAuthProvider();
    }
  }
  return authProviderInstance;
};

export * from './IAuthProvider.js';

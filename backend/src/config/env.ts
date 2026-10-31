import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database Type Switcher
  DATABASE_TYPE: z.enum(['supabase', 'mysql']).default('mysql'),

  // MySQL Configuration
  MYSQL_DB_HOST: z.string().default('127.0.0.1'),
  MYSQL_DB_PORT: z.coerce.number().default(3306),
  MYSQL_DB_NAME: z.string().default('brightloop_db'),
  MYSQL_DB_USER: z.string().default('root'),
  MYSQL_DB_PASSWORD: z.string().default(''),

  // Supabase PostgreSQL Configuration
  SUPABASE_DB_HOST: z.string().default('127.0.0.1'),
  SUPABASE_DB_PORT: z.coerce.number().default(5432),
  SUPABASE_DB_NAME: z.string().default('postgres'),
  SUPABASE_DB_USER: z.string().default('postgres'),
  SUPABASE_DB_PASSWORD: z.string().default(''),
  SUPABASE_DB_SSL: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),

  // Supabase Auth API
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().default('brightloop_default_jwt_secret_change_me_in_prod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
};

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;

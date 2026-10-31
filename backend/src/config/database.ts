import knex, { Knex } from 'knex';
import { env } from './env.js';

let dbInstance: Knex | null = null;

export const getDatabaseConfig = (): Knex.Config => {
  if (env.DATABASE_TYPE === 'supabase') {
    return {
      client: 'pg',
      connection: {
        host: env.SUPABASE_DB_HOST,
        port: env.SUPABASE_DB_PORT,
        user: env.SUPABASE_DB_USER,
        password: env.SUPABASE_DB_PASSWORD,
        database: env.SUPABASE_DB_NAME,
        ssl: env.SUPABASE_DB_SSL ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: 2,
        max: 10,
      },
      migrations: {
        directory: './src/database/migrations',
        extension: 'ts',
      },
      seeds: {
        directory: './src/database/seeds',
        extension: 'ts',
      },
    };
  }

  // Default to MySQL
  return {
    client: 'mysql2',
    connection: {
      host: env.MYSQL_DB_HOST,
      port: env.MYSQL_DB_PORT,
      user: env.MYSQL_DB_USER,
      password: env.MYSQL_DB_PASSWORD,
      database: env.MYSQL_DB_NAME,
      decimalNumbers: true,
      timezone: 'Z',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  };
};

export const getDb = (): Knex => {
  if (!dbInstance) {
    const config = getDatabaseConfig();
    dbInstance = knex(config);
  }
  return dbInstance;
};

export const testDatabaseConnection = async (): Promise<{
  connected: boolean;
  type: 'supabase' | 'mysql';
  latencyMs: number;
  message: string;
}> => {
  const db = getDb();
  const startTime = Date.now();
  try {
    await db.raw('SELECT 1 as ping');
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      type: env.DATABASE_TYPE,
      latencyMs,
      message: `Successfully connected to ${
        env.DATABASE_TYPE === 'supabase' ? 'Supabase PostgreSQL' : 'Local MySQL'
      } in ${latencyMs}ms`,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      type: env.DATABASE_TYPE,
      latencyMs,
      message: `Failed to connect to ${
        env.DATABASE_TYPE === 'supabase' ? 'Supabase PostgreSQL' : 'Local MySQL'
      }: ${error?.message || error}`,
    };
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
};

export default getDb;

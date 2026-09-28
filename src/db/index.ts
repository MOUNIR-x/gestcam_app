import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

    if (!connectionString && !process.env.SQL_HOST) {
      throw new Error(
        'Database configuration missing. Set DATABASE_URL (recommended for Supabase) or SQL_HOST credentials.'
      );
    }

    global._postgresPool = new Pool(
      connectionString
        ? {
            connectionString,
            // Supabase requires TLS for external connections. Its certificates
            // are managed by Supabase, hence certificate-chain verification is
            // delegated to the provider connection endpoint.
            ssl: { rejectUnauthorized: false },
            max: 10,
            connectionTimeoutMillis: 15_000,
          }
        : {
            host: process.env.SQL_HOST,
            user: process.env.SQL_ADMIN_USER || process.env.SQL_USER,
            password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME,
            port: Number(process.env.SQL_PORT) || 5432,
            max: 10,
            connectionTimeoutMillis: 15_000,
            ssl: process.env.SQL_HOST?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
          }
    );

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
export { schema };

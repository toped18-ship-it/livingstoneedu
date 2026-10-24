import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const isSsl = process.env.SQL_SSL === "true" || process.env.NODE_ENV === "production";
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || "localhost",
      user: process.env.SQL_USER || "postgres",
      password: process.env.SQL_PASSWORD || "",
      database: process.env.SQL_DB_NAME || "cloudsql",
      port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 5432,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
    });

    // Attach error handler ONCE per client connection when pooled client is created
    global._postgresPool.on('connect', (client) => {
      client.on('error', (err) => {
        console.warn('Notice: Handled client socket connection error:', err?.message || err);
      });
    });

    // Handle unexpected background socket drops on idle pool connections
    global._postgresPool.on('error', (err) => {
      console.warn('Notice: PostgreSQL pool connection event handled:', err?.message || err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });

import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { Pool } from 'pg';

const postgresUrl =
  process.env.POSTGRES_URL || process.env.STORAGE_POSTGRES_URL || process.env.STORAGE_URL || '';

const globalForAuth = globalThis as typeof globalThis & {
  authDatabase?: unknown;
};

function getAuthDatabase() {
  if (!globalForAuth.authDatabase) {
    if (postgresUrl) {
      globalForAuth.authDatabase = new Pool({
        connectionString: postgresUrl,
        ssl: { rejectUnauthorized: false },
      });
    } else {
      const Database = require('better-sqlite3');
      globalForAuth.authDatabase = new Database(process.env.SQLITE_PATH || 'meals.db');
    }
  }

  return globalForAuth.authDatabase as any;
}

export const auth = betterAuth({
  database: getAuthDatabase(),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [nextCookies()],
});

export async function getCurrentSession() {
  return auth.api.getSession({ headers: headers() });
}

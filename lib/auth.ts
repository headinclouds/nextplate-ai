import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { Pool } from 'pg';

const postgresUrl =
  process.env.POSTGRES_URL || process.env.STORAGE_POSTGRES_URL || process.env.STORAGE_URL || '';

if (!postgresUrl) {
  throw new Error('POSTGRES_URL (or STORAGE_POSTGRES_URL/STORAGE_URL) is required.');
}

// Local Postgres (e.g. Docker) has no SSL listener; hosted providers require it.
const isLocalPostgres = ['localhost', '127.0.0.1'].includes(new URL(postgresUrl).hostname);

const globalForAuth = globalThis as typeof globalThis & {
  authDatabase?: Pool;
};

function getAuthDatabase() {
  if (!globalForAuth.authDatabase) {
    globalForAuth.authDatabase = new Pool({
      connectionString: postgresUrl,
      ssl: isLocalPostgres ? false : { rejectUnauthorized: false },
    });
  }

  return globalForAuth.authDatabase;
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

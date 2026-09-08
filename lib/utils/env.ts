/**
 * Typed environment variable helper.
 * Throws at startup (server-side) if required env vars are missing.
 * Never import this on the client — it exposes server-only keys.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Make sure it is set in .env.local or your deployment environment.`
    );
  }
  return value;
}

export const env = {
  supabase: {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  },
} as const;

/** Public-safe env — safe to use in client components */
export const publicEnv = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  },
} as const;

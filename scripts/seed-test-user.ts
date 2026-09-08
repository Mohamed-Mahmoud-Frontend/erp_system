/**
 * scripts/seed-test-user.ts
 *
 * One-off script to create a test user in Supabase Auth for local dev.
 * Run with: npx tsx scripts/seed-test-user.ts
 *
 * Reads credentials from .env.local via dotenv.
 * Uses the admin client (service-role key) — never expose this to the browser.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local from project root
config({ path: resolve(process.cwd(), ".env.local") });

const TEST_EMAIL = "test@local.factory";

function generatePassword(length = 16): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  // Use Math.random — this is throwaway dev credentials, not a production secret
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  // Create a bare supabase-js admin client (not the app's typed one)
  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const password = generatePassword();

  console.log("⏳  Creating test user...");

  const { data, error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password,
    email_confirm: true, // skip confirmation email for dev
  });

  if (error) {
    // Handle duplicate user gracefully
    if (error.message?.includes("already been registered")) {
      console.log(
        `ℹ️  User ${TEST_EMAIL} already exists. Use the credentials you set previously.`
      );
      console.log(
        "   To reset the password, run this script with a different email or delete the user in Supabase Dashboard → Authentication → Users."
      );
      process.exit(0);
    }
    console.error("❌  Failed to create user:", error.message);
    process.exit(1);
  }

  // Confirm we actually got a user back
  if (!data.user?.id) {
    console.error("❌  createUser returned no user object — unexpected response.");
    process.exit(1);
  }

  console.log("✅  Test user created successfully!");
  console.log("─────────────────────────────────");
  console.log(`   Email   : ${TEST_EMAIL}`);
  console.log(`   Password: ${password}`);
  console.log(`   User ID : ${data.user.id}`);
  console.log("─────────────────────────────────");
  console.log("Use these credentials on the /login page to verify the auth flow.");
}

main().catch((err) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});

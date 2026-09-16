"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";

const LoginSchema = z.object({
  email: z.email({ error: ar.common.required }),
  password: z.string().min(1, { error: ar.common.required }),
});

export type LoginState =
  | {
      error?: string;
      fieldErrors?: { email?: string[]; password?: string[] };
    }
  | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // 1. Validate inputs server-side (never trust client data)
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as {
        email?: string[];
        password?: string[];
      },
    };
  }

  const { email, password } = parsed.data;

  // 2. Attempt Supabase sign-in
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Supabase sign-in failed:", error.status, error.name, error.message);
    return { error: ar.auth.invalidCredentials };
  }

  // 3. Redirect into dashboard on success
  //    redirect() throws — nothing after this line runs on success
  redirect("/dashboard");
}

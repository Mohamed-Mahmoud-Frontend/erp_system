"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Signs the current user out and redirects to /login.
 * Called as a Server Action from the dashboard layout's sign-out button.
 */
export async function signOutAction() {
  const supabase = await createClient();
  const {error}=await supabase.auth.signOut();
  if(error)return {message:'تعذر تسجيل الخروج. أعد المحاولة.'};
  redirect("/login");
}

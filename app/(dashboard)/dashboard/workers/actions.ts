"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { workerSchema, attendanceSchema, workerTransactionSchema } from "@/lib/validations/worker";

export async function createWorkerAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name"),
    daily_wage: Number(formData.get("daily_wage")) || 0,
  };

  const parsed = workerSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { error } = await supabase.from("workers").insert({
    name: parsed.data.name,
    daily_wage: parsed.data.daily_wage,
  });

  if (error) {
    return { message: "حدث خطأ أثناء إضافة العامل." };
  }

  revalidatePath("/dashboard/workers");
  redirect("/dashboard/workers");
}

export async function recordAttendanceAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    worker_id: formData.get("worker_id"),
    work_date: formData.get("work_date"),
    status: formData.get("status"),
    extra_units: Number(formData.get("extra_units")) || 0,
  };

  const parsed = attendanceSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { error } = await supabase.from("attendance").insert({
    worker_id: parsed.data.worker_id,
    work_date: parsed.data.work_date,
    status: parsed.data.status,
    extra_units: parsed.data.extra_units,
  });

  if (error) {
    // Usually unique constraint on worker_id + date
    if (error.code === "23505") {
      return { message: "تم تسجيل حضور هذا العامل في هذا اليوم مسبقاً." };
    }
    return { message: "حدث خطأ أثناء تسجيل الحضور." };
  }

  revalidatePath("/dashboard/workers/attendance");
  revalidatePath("/dashboard/workers");
  return { success: true, message: "تم تسجيل الحضور بنجاح" };
}

export async function recordWorkerTransactionAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    worker_id: formData.get("worker_id"),
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
  };

  const parsed = workerTransactionSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "تأكد من إدخال البيانات بشكل صحيح",
    };
  }

  const { error } = await supabase.from("worker_transactions").insert({
    worker_id: parsed.data.worker_id,
    type: parsed.data.type,
    amount: parsed.data.amount,
  });

  if (error) {
    return { message: "حدث خطأ أثناء تسجيل المعاملة." };
  }

  revalidatePath("/dashboard/workers");
  revalidatePath("/dashboard/workers/payouts");
  return { success: true, message: "تم التسجيل بنجاح" };
}

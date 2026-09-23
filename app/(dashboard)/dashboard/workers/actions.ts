"use server";

import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { payrollSaveError } from "@/lib/payroll-save-error";
import { allowed, getAccess } from "@/lib/access";
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "يجب تسجيل الدخول." };

  const rawData = {
    worker_id: formData.get("worker_id"),
    work_date: formData.get("work_date"),
    status: formData.get("status"),
    extra_units: Number(formData.get("extra_units") || 0),
    extra_type: formData.get("extra_type") || "amount",
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
    extra_type: parsed.data.extra_type,
  });

  if (error) {
    // Usually unique constraint on worker_id + date
    if (error.code === "23505") {
      return { message: "تم تسجيل حضور هذا العامل في هذا اليوم مسبقاً." };
    }
    return { message: "حدث خطأ أثناء تسجيل الحضور." };
  }

  revalidatePath("/dashboard/workers/attendance");
  revalidatePath("/dashboard/workers/payouts");
  revalidatePath("/dashboard/workers");
  return { success: true, message: "تم تسجيل الحضور بنجاح" };
}

export async function recordWorkerTransactionAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "يجب تسجيل الدخول." };

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

export async function deleteWorkerAction(workerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "يجب تسجيل الدخول." };

  // Try direct deletion first (succeeds if no FK references exist)
  const { error: deleteError } = await supabase.from("workers").delete().eq("id", workerId);

  if (!deleteError) {
    revalidatePath("/dashboard/workers");
    revalidatePath("/dashboard/workers/attendance");
    revalidatePath("/dashboard/workers/payouts");
    return { success: true, message: "تم حذف العامل نهائياً من النظام." };
  }

  // If deletion fails due to foreign key constraints (records exist), mark as stopped
  const { data: worker } = await supabase.from("workers").select("name").eq("id", workerId).single();
  if (worker) {
    const cleanName = worker.name.replace(/\s*\(متوقف\)\s*$/, "").trim();
    const stoppedName = `${cleanName} (متوقف)`;
    await supabase.from("workers").update({ name: stoppedName }).eq("id", workerId);

    revalidatePath("/dashboard/workers");
    revalidatePath("/dashboard/workers/attendance");
    revalidatePath("/dashboard/workers/payouts");
    return {
      success: true,
      message: "تم إيقاف العامل عن العمل وحفظ أرشيف سجلات الحضور والرواتب السابقة.",
    };
  }

  return { success: false, message: "تعذر إتمام العملية. يرجى المحاولة لاحقاً." };
}

export async function toggleWorkerStatusAction(workerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "يجب تسجيل الدخول." };

  const { data: worker } = await supabase.from("workers").select("name").eq("id", workerId).single();
  if (!worker) return { success: false, message: "العامل غير موجود." };

  const isStopped = worker.name.includes("(متوقف)");
  const newName = isStopped
    ? worker.name.replace(/\s*\(متوقف\)\s*$/, "").trim()
    : `${worker.name.trim()} (متوقف)`;

  const { error } = await supabase.from("workers").update({ name: newName }).eq("id", workerId);
  if (error) return { success: false, message: "تعذر تحديث حالة العامل." };

  revalidatePath("/dashboard/workers");
  revalidatePath("/dashboard/workers/attendance");
  revalidatePath("/dashboard/workers/payouts");
  return {
    success: true,
    message: isStopped ? "تمت إعادة تفعيل العامل على رأس العمل." : "تم إيقاف العامل عن العمل.",
  };
}


export async function recordWorkerDayAction(_state: unknown, formData: FormData) {
  const supabase=await createClient();
  const parsed=attendanceSchema.safeParse({
    worker_id:formData.get("worker_id"),work_date:formData.get("work_date"),
    status:formData.get("status"),extra_type:formData.get("extra_type"),
    extra_units:Number(formData.get("extra_units")||0),
  });
  const amounts=["advance","bonus","deduction"].map(key=>Number(formData.get(key)||0));
  if(!parsed.success || amounts.some(value=>!Number.isFinite(value)||value<0||new Decimal(value).decimalPlaces()>2)){
    return {success:false,message:"راجع بيانات اليومية والمبالغ. اكتب صفرًا إذا لا توجد معاملة."};
  }  const {error}=await supabase.rpc("record_worker_day",{
    p_worker_id:parsed.data.worker_id,p_work_date:parsed.data.work_date,
    p_status:parsed.data.status,p_extra_type:parsed.data.extra_type,
    p_extra_units:parsed.data.extra_units,p_advance:amounts[0],p_bonus:amounts[1],p_deduction:amounts[2],
  });
  if(error) {
    console.error("Worker daily save failed", {code:error.code});
    return {success:false,message:payrollSaveError(error)};
  }
  revalidatePath("/dashboard/workers/attendance");
  revalidatePath("/dashboard/workers/payouts");
  revalidatePath("/dashboard/workers");
  return {success:true,message:"تم حفظ الحضور والسلفة والمكافأة والخصم معًا."};
}
export async function deleteWorkerDayAction(_state: unknown, formData: FormData) {
  const id=String(formData.get("id")||"");
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)) return {success:false,message:"سجل غير صالح."};
  if(!allowed(await getAccess(),"admin")) return {success:false,message:"الحذف متاح للمدير فقط."};
  const db=await createClient();
  const {data,error}=await db.rpc("delete_worker_day",{p_attendance_id:id});
  if(error) return {success:false,message:error.message||"تعذر حذف اليومية."};
  if(!data) return {success:false,message:"السجل غير موجود."};
  revalidatePath("/dashboard/workers/attendance");
  revalidatePath("/dashboard/workers/payouts");
  revalidatePath("/dashboard/workers");
  return {success:true,message:"تم حذف اليومية والمعاملات المرتبطة بها."};
}
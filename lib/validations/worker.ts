import { z } from "zod";

export const workerSchema = z.object({
  name: z.string().min(2, "اسم العامل مطلوب"),
  daily_wage: z.number().min(0, "الأجر اليومي يجب أن يكون موجباً"),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;

export const attendanceSchema = z.object({
  worker_id: z.string().uuid("العامل مطلوب"),
  work_date: z.string(),
  status: z.enum(["present", "absent", "half_day"]),
  extra_units: z.number().min(0).default(0), // overtime hours or extra pieces
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export const workerTransactionSchema = z.object({
  worker_id: z.string().uuid("العامل مطلوب"),
  type: z.enum(["bonus", "deduction", "payout"]),
  amount: z.number().min(0.01, "المبلغ يجب أن يكون أكبر من الصفر"),
});

export type WorkerTransactionFormValues = z.infer<typeof workerTransactionSchema>;

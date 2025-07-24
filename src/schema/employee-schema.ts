import { EmployeeAttendanceStatus } from "@/lib/prisma/generated";
import { z } from "zod";

export const createEmployeeSchema = z.object({
  action: z.literal("create"),
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().optional(),
  password: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID harus diisi"),
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().optional(),
  password: z.string().optional(),
});

export const upsertEmployeeSchema = z.discriminatedUnion("action", [
  createEmployeeSchema,
  updateEmployeeSchema,
]);
export type UpsertEmployeeSchema = z.infer<typeof upsertEmployeeSchema>;

export const createAttendanceSchema = z.object({
  action: z.literal("create"),
  employeeId: z.string().min(1, "Karyawan harus diisi"),
  status: z.nativeEnum(EmployeeAttendanceStatus, {
    errorMap: () => ({ message: "Status harus diisi" }),
  }),
  date: z.coerce.date(),
});
export type CreateAttendanceSchema = z.infer<typeof createAttendanceSchema>;

export const updateAttendanceSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID kehadiran harus diisi"),
  employeeId: z.string().min(1, "Karyawan harus diisi"),
  status: z.nativeEnum(EmployeeAttendanceStatus, {
    errorMap: () => ({ message: "Status harus diisi" }),
  }),
  date: z.coerce.date(),
});
export type UpdateAttendanceSchema = z.infer<typeof updateAttendanceSchema>;

export const upsertAttendanceSchema = z.discriminatedUnion("action", [
  createAttendanceSchema,
  updateAttendanceSchema,
]);
export type UpsertAttendanceSchema = z.infer<typeof upsertAttendanceSchema>;

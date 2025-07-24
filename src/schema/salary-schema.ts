import { z } from "zod";

export const createSalarySchema = z.object({
  action: z.literal("create"),
  totalAmount: z.coerce.number().min(1, "Total harus diisi"),
  note: z.string().optional(),
  employeeId: z.string().min(1, "Karyawan harus diisi"),
});
export type CreateSalarySchema = z.infer<typeof createSalarySchema>;

export const updateSalarySchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID harus diisi"),
  totalAmount: z.coerce.number().min(1, "Total harus diisi"),
  note: z.string().optional(),
  employeeId: z.string().min(1, "Karyawan harus diisi"),
});
export type UpdateSalarySchema = z.infer<typeof updateSalarySchema>;

export const upsertSalarySchema = z.discriminatedUnion("action", [
  createSalarySchema,
  updateSalarySchema,
]);
export type UpsertSalarySchema = z.infer<typeof upsertSalarySchema>;

export const deleteSalarySchema = z.object({
  action: z.literal("delete"),
  id: z.string().min(1, "ID harus diisi"),
});
export type DeleteSalarySchema = z.infer<typeof deleteSalarySchema>;

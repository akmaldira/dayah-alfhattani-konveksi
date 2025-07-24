import { z } from "zod";

export const createDailyWorkSchema = z.object({
  action: z.literal("create"),
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().optional(),
  employeeId: z.string().min(1, "Karyawan harus diisi"),
});
export type CreateDailyWorkSchema = z.infer<typeof createDailyWorkSchema>;

export const updateDailyWorkSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID harus diisi"),
  name: z.string().min(1, "Nama harus diisi"),
  description: z.string().optional(),
  employeeId: z.string().min(1, "Karyawan harus diisi"),
});
export type UpdateDailyWorkSchema = z.infer<typeof updateDailyWorkSchema>;

export const upsertDailyWorkSchema = z.discriminatedUnion("action", [
  createDailyWorkSchema,
  updateDailyWorkSchema,
]);
export type UpsertDailyWorkSchema = z.infer<typeof upsertDailyWorkSchema>;

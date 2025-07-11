import { z } from "zod";

export const createUnitSchema = z.object({
  action: z.literal("create"),
  fromUnit: z.string().min(1, "Satuan awal harus diisi"),
  multiplier: z.coerce.number().min(0, "Multiplier konversi harus diisi"),
});
export type CreateUnitSchema = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = z.object({
  action: z.literal("update"),
  _id: z.string(),
  fromUnit: z.string().min(1, "Satuan awal harus diisi"),
  multiplier: z.coerce.number().min(0, "Multiplier konversi harus diisi"),
  isDeleted: z.boolean().optional(),
});
export type UpdateUnitSchema = z.infer<typeof updateUnitSchema>;

export const upsertUnitSchema = z.discriminatedUnion("action", [
  createUnitSchema,
  updateUnitSchema,
]);
export type UpsertUnitSchema = z.infer<typeof upsertUnitSchema>;

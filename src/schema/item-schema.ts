import z from "zod";
import { createUnitSchema, upsertUnitSchema } from "./unit-schema";
import { createVariantSchema, upsertVariantSchema } from "./variant-schema";

export const createItemSchema = z.object({
  action: z.literal("create"),
  name: z.string().min(1, "Nama item harus diisi"),
  defaultUnit: z.string().min(1, "Satuan item harus diisi"),
  variants: z.array(createVariantSchema).min(1, "Harus ada minimal 1 varian"),
  unitConversions: z.array(createUnitSchema),
});
export type CreateItemSchema = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID item harus diisi"),
  name: z.string().min(1, "Nama item harus diisi"),
  defaultUnit: z.string().min(1, "Satuan item harus diisi"),
  variants: z.array(upsertVariantSchema).min(1, "Harus ada minimal 1 varian"),
  unitConversions: z.array(upsertUnitSchema),
});
export type UpdateItemSchema = z.infer<typeof updateItemSchema>;

export const upsertItemSchema = z.discriminatedUnion("action", [
  createItemSchema,
  updateItemSchema,
]);
export type UpsertItemSchema = z.infer<typeof upsertItemSchema>;

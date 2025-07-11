import { z } from "zod";

export const createVariantSchema = z.object({
  action: z.literal("create"),
  name: z.string().min(1, "Nama varian harus diisi"),
  currentStock: z.coerce.number().min(0, "Stok saat ini harus diisi"),
});
export type CreateVariantSchema = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = z.object({
  action: z.literal("update"),
  _id: z.string(),
  name: z.string().min(1, "Nama varian harus diisi"),
  currentStock: z.coerce.number().min(0, "Stok saat ini harus diisi"),
  isDeleted: z.boolean().optional(),
});
export type UpdateVariantSchema = z.infer<typeof updateVariantSchema>;

export const upsertVariantSchema = z.discriminatedUnion("action", [
  createVariantSchema,
  updateVariantSchema,
]);
export type UpsertVariantSchema = z.infer<typeof upsertVariantSchema>;

export const createVariantWithItemIdSchema = createVariantSchema.extend({
  itemId: z.string().min(1, "ID barang harus diisi"),
});
export type CreateVariantWithItemIdSchema = z.infer<
  typeof createVariantWithItemIdSchema
>;

export const updateVariantWithItemIdSchema = updateVariantSchema.extend({
  itemId: z.string().min(1, "ID barang harus diisi"),
});
export type UpdateVariantWithItemIdSchema = z.infer<
  typeof updateVariantWithItemIdSchema
>;

export const upsertVariantWithItemIdSchema = z.discriminatedUnion("action", [
  createVariantWithItemIdSchema,
  updateVariantWithItemIdSchema,
]);
export type UpsertVariantWithItemIdSchema = z.infer<
  typeof upsertVariantWithItemIdSchema
>;

export const deleteVariantWithItemIdSchema = z.object({
  action: z.literal("delete"),
  _id: z.string(),
  itemId: z.string().min(1, "ID barang harus diisi"),
});
export type DeleteVariantWithItemIdSchema = z.infer<
  typeof deleteVariantWithItemIdSchema
>;

export const addStockWithoutOrderSchema = z.object({
  action: z.literal("add"),
  _id: z.string().min(1, "ID varian harus diisi"),
  itemId: z.string().min(1, "ID barang harus diisi"),
  unitId: z.string().min(1, "ID satuan harus diisi"),
  quantity: z.coerce.number().min(1, "Jumlah harus diisi"),
  note: z.string().optional(),
});
export type AddStockWithoutOrderSchema = z.infer<
  typeof addStockWithoutOrderSchema
>;

export const addStockWithOrderSchema = addStockWithoutOrderSchema.extend({
  action: z.literal("addWithOrder"),
  source: z.string().optional(),
  totalPrice: z.coerce.number().min(1, "Harga total harus diisi"),
});
export type AddStockWithOrderSchema = z.infer<typeof addStockWithOrderSchema>;

export const addStockSchema = z.discriminatedUnion("action", [
  addStockWithoutOrderSchema,
  addStockWithOrderSchema,
]);
export type AddStockSchema = z.infer<typeof addStockSchema>;

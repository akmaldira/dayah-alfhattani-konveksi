import { z } from "zod";

export const createTransactionItemWithoutVariantSchema = z.object({
  type: z.literal("item"),
  name: z.string().min(1, "Nama item harus diisi"),
  quantity: z.coerce.number().min(1, "Jumlah item harus diisi"),
  supplier: z.string().optional(),
  totalPrice: z.coerce.number().min(1, "Harga total item harus diisi"),
});
export type CreateTransactionItemWithoutVariantSchema = z.infer<
  typeof createTransactionItemWithoutVariantSchema
>;

export const createTransactionItemWithVariantSchema =
  createTransactionItemWithoutVariantSchema.extend({
    type: z.literal("itemWithVariant"),
    itemId: z.string().min(1, "Item harus dipilih"),
    variantId: z.string().min(1, "Varian harus dipilih"),
    unitId: z.string().min(1, "Satuan harus dipilih"),
    appendToStock: z.coerce.boolean(),
  });
export type CreateTransactionItemWithVariantSchema = z.infer<
  typeof createTransactionItemWithVariantSchema
>;

export const createTransactionItemSchema = z.discriminatedUnion("type", [
  createTransactionItemWithoutVariantSchema,
  createTransactionItemWithVariantSchema,
]);
export type CreateTransactionItemSchema = z.infer<
  typeof createTransactionItemSchema
>;

export const createTransactionSchema = z.object({
  action: z.literal("create"),
  source: z.string().optional(), //supplier, customer, etc
  note: z.string().optional(),
  items: z.array(createTransactionItemSchema),
});
export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID transaksi harus diisi"),
  source: z.string().optional(), //supplier, customer, etc
  note: z.string().optional(),
  items: z.array(createTransactionItemSchema),
});
export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;

export const upsertTransactionSchema = z.discriminatedUnion("action", [
  createTransactionSchema,
  updateTransactionSchema,
]);
export type UpsertTransactionSchema = z.infer<typeof upsertTransactionSchema>;

export const increaseCashSchema = z.object({
  action: z.literal("increase"),
  amount: z.coerce.number().min(1, "Jumlah saldo harus diisi"),
  note: z.string().optional(),
});
export type IncreaseCashSchema = z.infer<typeof increaseCashSchema>;

export const decreaseCashSchema = z.object({
  action: z.literal("decrease"),
  amount: z.coerce.number().min(1, "Jumlah saldo harus diisi"),
  note: z.string().optional(),
});
export type DecreaseCashSchema = z.infer<typeof decreaseCashSchema>;

export const upsertCashSchema = z.discriminatedUnion("action", [
  increaseCashSchema,
  decreaseCashSchema,
]);
export type UpsertCashSchema = z.infer<typeof upsertCashSchema>;

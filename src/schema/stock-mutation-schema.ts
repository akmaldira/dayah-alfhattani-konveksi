import { StockMutationType } from "@/lib/prisma/generated";
import { z } from "zod";

export const createStockMutationSchema = z.object({
  action: z.literal("create"),
  variantId: z.string().min(1, "Varian harus dipilih"),
  type: z.nativeEnum(StockMutationType, {
    required_error: "Tipe perubahan harus dipilih",
  }),
  quantity: z.coerce.number(),
  source: z.string().optional(),
  note: z.string().optional(),
});
export type CreateStockMutationSchema = z.infer<
  typeof createStockMutationSchema
>;

export const updateStockMutationSchema = z.object({
  action: z.literal("update"),
  id: z.string().min(1, "ID perubahan stok harus dipilih"),
  variantId: z.string().min(1, "Varian harus dipilih"),
  type: z.nativeEnum(StockMutationType, {
    required_error: "Tipe perubahan harus dipilih",
  }),
  quantity: z.coerce.number(),
  source: z.string().optional(),
  note: z.string().optional(),
});
export type UpdateStockMutationSchema = z.infer<
  typeof updateStockMutationSchema
>;

export const upsertStockMutationSchema = z.discriminatedUnion("action", [
  createStockMutationSchema,
  updateStockMutationSchema,
]);
export type UpsertStockMutationSchema = z.infer<
  typeof upsertStockMutationSchema
>;

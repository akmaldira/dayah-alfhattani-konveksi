import { Variant } from "@/lib/prisma/generated";
import { PrismaTransaction } from "@/types/prisma";

export async function updateVariantWithStockAdjustment({
  tx,
  oldVariant,
  newVariant,
  createdById,
}: {
  tx: PrismaTransaction;
  oldVariant: Variant;
  newVariant: {
    name: string;
    currentStock: number;
  };
  createdById: string;
}): Promise<Variant> {
  if (oldVariant.currentStock !== newVariant.currentStock) {
    const adjustmentQuantity =
      newVariant.currentStock - oldVariant.currentStock;
    await tx.stockMutation.create({
      data: {
        variantId: oldVariant.id,
        type: "ADJUSTMENT",
        quantity: adjustmentQuantity,
        unit: oldVariant.unit,
        source: "Perubahan stok",
        note: `${
          adjustmentQuantity > 0 ? "Penambahan" : "Pengurangan"
        } stok, Sebelumnya: ${oldVariant.currentStock} ${
          oldVariant.unit
        }, Menjadi: ${newVariant.currentStock} ${oldVariant.unit}`,
        createdById,
      },
    });
  }
  return await tx.variant.update({
    where: { id: oldVariant.id },
    data: {
      name: newVariant.name,
      currentStock: newVariant.currentStock,
    },
  });
}

import { UnitConversion, Variant } from "@/lib/prisma/generated";
import { PrismaTransaction } from "@/types/prisma";

export async function updateVariantWithStockAdjustment({
  tx,
  oldVariant,
  newVariant,
  createdById,
  defaultUnitConversion,
}: {
  tx: PrismaTransaction;
  oldVariant: Variant;
  newVariant: {
    name: string;
    currentStock: number;
  };
  createdById: string;
  defaultUnitConversion: UnitConversion;
}): Promise<Variant> {
  if (oldVariant.currentStock !== newVariant.currentStock) {
    const adjustmentQuantity =
      newVariant.currentStock - oldVariant.currentStock;
    await tx.stockMutation.create({
      data: {
        variantId: oldVariant.id,
        type: "ADJUSTMENT",
        quantity: adjustmentQuantity,
        unitConversionId: defaultUnitConversion.id,
        source: "Perubahan stok",
        note: `${
          adjustmentQuantity > 0 ? "Penambahan" : "Pengurangan"
        } stok, Sebelumnya: ${oldVariant.currentStock} ${
          defaultUnitConversion.fromUnit
        }, Menjadi: ${newVariant.currentStock} ${
          defaultUnitConversion.fromUnit
        }`,
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

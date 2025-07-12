"use server";

import { auth } from "@/lib/auth";
import { CASH_BALANCE_ID } from "@/lib/const";
import { prisma } from "@/lib/prisma";
import { Variant } from "@/lib/prisma/generated";
import { updateVariantWithStockAdjustment } from "@/lib/prisma/variant";
import {
  addStockSchema,
  AddStockSchema,
  DeleteVariantWithItemIdSchema,
  deleteVariantWithItemIdSchema,
  UpsertVariantWithItemIdSchema,
  upsertVariantWithItemIdSchema,
} from "@/schema/variant-schema";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

export async function upsertVariantAction(
  values: UpsertVariantWithItemIdSchema
): Promise<ActionResponse<Variant>> {
  try {
    const { data, error } = upsertVariantWithItemIdSchema.safeParse(values);

    if (error) {
      return {
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      };
    }

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return {
        status: "error",
        redirect: "/signin",
        error: {
          code: "UNAUTHORIZED",
          message: "Anda harus login untuk melakukan tindakan ini",
        },
      };
    }

    const item = await prisma.item.findUnique({
      where: {
        id: data.itemId,
      },
    });

    if (!item) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Barang tidak ditemukan",
        },
      };
    }

    let variant: Variant;
    if (data.action === "update") {
      const variantTransaction = await prisma.$transaction(async (tx) => {
        const oldVariant = await tx.variant.findUnique({
          where: {
            id: data._id,
          },
        });

        if (!oldVariant) {
          throw new Error("Varian tidak ditemukan");
        }

        return await updateVariantWithStockAdjustment({
          tx,
          oldVariant,
          newVariant: data,
          createdById: user.id,
        });
      });

      variant = variantTransaction;
    } else {
      variant = await prisma.variant.create({
        data: {
          name: data.name,
          currentStock: data.currentStock,
          unit: item.defaultUnit,
          item: {
            connect: {
              id: data.itemId,
            },
          },
        },
      });
    }

    return {
      status: "success",
      data: variant,
      message: `Varian ${variant.name} berhasil ${
        data.action === "update" ? "diperbarui" : "ditambahkan"
      }`,
      redirect: `/app/item?expandedItem=${item.uniqueName}`,
    };
  } catch (error: any) {
    console.error(`[upsertVariantAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function deleteVariantAction(
  values: DeleteVariantWithItemIdSchema
): Promise<ActionResponse<Variant>> {
  try {
    const { data, error } = deleteVariantWithItemIdSchema.safeParse(values);

    if (error) {
      return {
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      };
    }

    const item = await prisma.item.findUnique({
      where: {
        id: data.itemId,
      },
    });

    if (!item) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Barang tidak ditemukan",
        },
      };
    }

    const variant = await prisma.variant.findUnique({
      where: {
        id: data._id,
      },
    });

    if (!variant) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Varian tidak ditemukan",
        },
      };
    }

    const deletedVariant = await prisma.variant.delete({
      where: {
        id: data._id,
      },
    });

    return {
      status: "success",
      data: deletedVariant,
      message: `Varian ${deletedVariant.name} berhasil dihapus`,
      redirect: `/app/item?expandedItem=${item.uniqueName}`,
    };
  } catch (error: any) {
    console.error(`[deleteVariantAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function addStockAction(
  values: AddStockSchema
): Promise<ActionResponse<Variant>> {
  try {
    const { data, error } = addStockSchema.safeParse(values);

    if (error) {
      return {
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      };
    }

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return {
        status: "error",
        redirect: "/signin",
        error: {
          code: "UNAUTHORIZED",
          message: "Anda harus login untuk melakukan tindakan ini",
        },
      };
    }

    const cashBalance = await prisma.cashBalance.upsert({
      where: { id: CASH_BALANCE_ID },
      update: {},
      create: {},
    });

    const item = await prisma.item.findUnique({
      where: {
        id: data.itemId,
      },
    });

    if (!item) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Barang tidak ditemukan",
        },
      };
    }

    const variant = await prisma.variant.findUnique({
      where: {
        id: data._id,
      },
    });

    if (!variant) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Varian tidak ditemukan",
        },
      };
    }

    const unit = await prisma.unitConversion.findUnique({
      where: {
        id: data.unitId,
      },
    });

    if (!unit) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Satuan tidak ditemukan",
        },
      };
    }

    await prisma.$transaction(async (tx) => {
      const stockMutation = await tx.stockMutation.create({
        data: {
          variantId: variant.id,
          quantity: data.quantity,
          type: "IN",
          unit: unit.fromUnit,
          source: "Penambahan stok",
          note: data.note,
          createdById: user.id,
        },
      });

      const stockToDefaultUnit = data.quantity * unit.multiplier;
      await tx.variant.update({
        where: {
          id: variant.id,
        },
        data: {
          currentStock: {
            increment: stockToDefaultUnit,
          },
        },
      });

      if (data.action === "addWithOrder") {
        const transaction = await tx.transaction.create({
          data: {
            type: "EXPENSE",
            totalAmount: data.totalAmount,
            source: data.supplier,
            note: data.note,
            createdById: user.id,
            items: {
              create: {
                mutationId: stockMutation.id,
                name: `${item.name} - ${variant.name}`,
                quantity: data.quantity,
                unit: unit.fromUnit,
                supplier: data.supplier,
                totalPrice: data.totalAmount,
              },
            },
          },
        });

        const nextBalance = cashBalance.balance - data.totalAmount;
        await tx.cashAuditLog.create({
          data: {
            type: "EXPENSE",
            amount: data.totalAmount,
            createdById: user.id,
            previousBalance: cashBalance.balance,
            nextBalance,
            note: `Pembelian ${item.name} - ${variant.name} dengan jumlah ${data.quantity} ${unit.fromUnit}`,
            transaction: {
              connect: {
                id: transaction.id,
              },
            },
          },
        });

        await tx.cashBalance.update({
          where: {
            id: cashBalance.id,
          },
          data: {
            balance: {
              decrement: data.totalAmount,
            },
          },
        });
      }
    });

    revalidatePath("/app/item/stock-history");
    return {
      status: "success",
      data: variant,
      message: `Stok ${variant.name} berhasil ditambahkan`,
      redirect: "/app/item/stock-history",
    };
  } catch (error: any) {
    console.error(`[addStockAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

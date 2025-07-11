"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Variant } from "@/lib/prisma/generated";
import { updateVariantWithStockAdjustment } from "@/lib/prisma/variant";
import {
  DeleteVariantWithItemIdSchema,
  deleteVariantWithItemIdSchema,
  UpsertVariantWithItemIdSchema,
  upsertVariantWithItemIdSchema,
} from "@/schema/variant-schema";
import { ActionResponse } from "@/types/action";

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

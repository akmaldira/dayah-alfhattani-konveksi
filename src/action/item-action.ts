"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateVariantWithStockAdjustment } from "@/lib/prisma/variant";
import { upsertItemSchema, UpsertItemSchema } from "@/schema/item-schema";
import { ActionResponse } from "@/types/action";
import { ItemWithRelations } from "@/types/prisma";
import { revalidatePath } from "next/cache";

export async function upsertItemAction(
  values: UpsertItemSchema
): Promise<ActionResponse<ItemWithRelations>> {
  try {
    const { data, error } = upsertItemSchema.safeParse(values);

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

    let item: ItemWithRelations;
    if (data.action === "update") {
      const itemTransaction = await prisma.$transaction(async (tx) => {
        for (const variant of data.variants) {
          if (variant.action === "create") {
            await tx.variant.create({
              data: {
                name: variant.name,
                unit: data.defaultUnit,
                currentStock: variant.currentStock,
                item: {
                  connect: {
                    id: data.id,
                  },
                },
              },
            });
          } else {
            if (variant.isDeleted) {
              await tx.variant.delete({
                where: { id: variant._id },
              });
            } else {
              const oldVariant = await tx.variant.findUnique({
                where: { id: variant._id },
              });
              if (!oldVariant) {
                throw new Error("Variant tidak ditemukan");
              }

              await updateVariantWithStockAdjustment({
                tx,
                oldVariant,
                newVariant: variant,
                createdById: user.id,
              });
            }
          }
        }
        for (const conversion of data.unitConversions) {
          if (conversion.action === "create") {
            await tx.unitConversion.create({
              data: {
                fromUnit: conversion.fromUnit,
                toUnit: data.defaultUnit,
                multiplier: conversion.multiplier,
                itemId: data.id,
              },
            });
          } else {
            if (conversion.isDeleted) {
              await tx.unitConversion.delete({
                where: { id: conversion._id },
              });
            } else {
              await tx.unitConversion.update({
                where: { id: conversion._id },
                data: {
                  fromUnit: conversion.fromUnit,
                  multiplier: conversion.multiplier,
                },
              });
            }
          }
        }

        return await tx.item.update({
          where: { id: data.id },
          data: {
            name: data.name,
            uniqueName: data.name.toLowerCase().replace(/ /g, "-"),
          },
          include: {
            variants: true,
            conversions: true,
          },
        });
      });
      item = itemTransaction;
    } else {
      item = await prisma.item.create({
        data: {
          name: data.name,
          uniqueName: data.name.toLowerCase().replace(/ /g, "-"),
          defaultUnit: data.defaultUnit,
          variants: {
            createMany: {
              data: data.variants.map((variant) => ({
                name: variant.name,
                unit: data.defaultUnit,
                currentStock: variant.currentStock,
              })),
            },
          },
          conversions: {
            createMany: {
              data: [
                ...data.unitConversions,
                {
                  fromUnit: data.defaultUnit,
                  toUnit: data.defaultUnit,
                  multiplier: 1,
                },
              ].map((conversion) => ({
                fromUnit: conversion.fromUnit,
                toUnit: data.defaultUnit,
                multiplier: conversion.multiplier,
              })),
              skipDuplicates: false,
            },
          },
          createdBy: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          variants: true,
          conversions: true,
          createdBy: true,
        },
      });
      await prisma.stockMutation.createMany({
        data: item.variants
          .filter((variant) => variant.currentStock > 0)
          .map((variant) => ({
            variantId: variant.id,
            type: "IN",
            quantity: variant.currentStock,
            unit: data.defaultUnit,
            source: "Stok Awal",
            note: `Stok awal saat pembuatan varian ${variant.name}`,
            createdById: user.id,
          })),
      });
    }

    revalidatePath("/app/item");
    return {
      status: "success",
      data: item,
      message: `Item ${item.name} berhasil ${
        "id" in values ? "diperbarui" : "dibuat"
      }`,
      redirect: "/app/item",
    };
  } catch (error: any) {
    console.error(`[upsertItemAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function getItemDetailsAction(
  uniqueName: string
): Promise<ActionResponse<ItemWithRelations>> {
  try {
    const item = await prisma.item.findUnique({
      where: { uniqueName },
      include: { variants: true, conversions: true },
    });

    if (!item) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Item tidak ditemukan",
        },
      };
    }

    return {
      status: "success",
      data: item,
    };
  } catch (error: any) {
    console.error(`[getItemDetailsAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

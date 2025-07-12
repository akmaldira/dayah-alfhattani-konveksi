import { UpdateItemSchema } from "@/schema/item-schema";
import { UpsertTransactionSchema } from "@/schema/transaction-schema";
import { ActionResponse } from "@/types/action";
import { ItemWithRelations, TransactionWithRelations } from "@/types/prisma";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { StockMutationType, TransactionType } from "./prisma/generated";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleActionResponse<T>(response: ActionResponse<T>) {
  if (response.redirect) {
    window.location.href = response.redirect;
  }
  if (response.status === "success") {
    if (response.message) toast.success(response.message);
    return response.data;
  } else {
    toast.error(response.error.message);
    return null;
  }
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(date);
}

export function formatCurrency(amount: number, currency: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function itemToUpdateItem(item: ItemWithRelations): UpdateItemSchema {
  return {
    action: "update" as const,
    id: item.id,
    name: item.name,
    defaultUnit: item.defaultUnit,
    variants: item.variants.map((variant) => ({
      action: "update" as const,
      _id: variant.id,
      name: variant.name,
      currentStock: variant.currentStock,
    })),
    unitConversions: item.conversions.map((conversion) => ({
      action: "update" as const,
      _id: conversion.id,
      fromUnit: conversion.fromUnit,
      multiplier: conversion.multiplier,
    })),
  };
}

export function transactionToUpdateTransaction(
  transaction: TransactionWithRelations
): UpsertTransactionSchema {
  return {
    action: "update" as const,
    id: transaction.id,
    source: transaction.source ?? "",
    note: transaction.note ?? "",
    items: transaction.items.map((item) => {
      if (item.mutation) {
        return {
          type: "itemWithVariant" as const,
          name: item.name,
          quantity: item.quantity,
          unitId: "",
          supplier: item.supplier ?? "",
          itemId: item.mutation?.variant?.item.id ?? "",
          variantId: item.mutation?.variant.id ?? "",
          appendToStock: true,
          totalPrice: item.totalPrice,
        };
      }
      return {
        type: "item" as const,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit ?? "",
        supplier: item.supplier ?? "",
        totalPrice: item.totalPrice,
      };
    }),
  };
}

export function stockMutationTypeToBadge(type: StockMutationType) {
  const config = {
    label: "",
    variant: "default",
  };

  switch (type) {
    case "IN":
      config.label = "Stok Masuk";
      config.variant = "green";
      break;
    case "OUT":
      config.label = "Stok Keluar";
      config.variant = "destructive";
      break;
    default:
      config.label = "Perubahan Stok";
      config.variant = "yellow";
      break;
  }

  return config as {
    label: string;
    variant:
      | "default"
      | "green"
      | "destructive"
      | "yellow"
      | "orange"
      | "purple";
  };
}

export function transactionTypeToBadge(type: TransactionType) {
  const config = {
    label: "",
    variant: "default",
  };

  switch (type) {
    case "EXPENSE":
      config.label = "Pengeluaran";
      config.variant = "destructive";
      break;
    case "INCOME":
      config.label = "Pemasukan";
      config.variant = "green";
      break;
    default:
      config.label = "Perubahan";
      config.variant = "yellow";
  }

  return config as {
    label: string;
    variant:
      | "default"
      | "green"
      | "destructive"
      | "yellow"
      | "orange"
      | "purple";
  };
}

export function pathnameToLabel(pathname: string) {
  const splitedPathname = pathname.split("-");
  const label = splitedPathname
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
  return label;
}

export function differenceAmountPercentage(
  currentAmount: number,
  previousAmount: number
) {
  const result = ((currentAmount - previousAmount) / previousAmount) * 100;
  if (isNaN(result)) return 0;
  if (result === Infinity) return 100;
  if (result === -Infinity) return -100;
  return Math.abs(result);
}

export function differenceAmountPercentageToString(
  currentAmount: number,
  previousAmount: number
) {
  const percentage = differenceAmountPercentage(currentAmount, previousAmount);
  return `${percentage.toFixed(2)}%`;
}

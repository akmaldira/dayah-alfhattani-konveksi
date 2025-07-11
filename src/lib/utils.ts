import { UpdateItemSchema } from "@/schema/item-schema";
import { ActionResponse } from "@/types/action";
import { ItemWithRelations } from "@/types/prisma";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { StockMutationType } from "./prisma/generated";

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

export function pathnameToLabel(pathname: string) {
  const splitedPathname = pathname.split("-");
  const label = splitedPathname
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
  return label;
}

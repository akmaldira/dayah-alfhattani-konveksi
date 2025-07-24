"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, stockMutationTypeToBadge } from "@/lib/utils";
import { StockMutationWithRelations } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";

export const columns: ColumnDef<StockMutationWithRelations>[] = [
  {
    id: "item",
    accessorKey: "variant.item.name",
    header: "Nama Barang",
    filterFn: (row, _id, filterValue) => {
      const itemString = [
        row.original.variant.item.name,
        row.original.variant.name,
      ].join(" ");

      const searchTerms = Array.isArray(filterValue)
        ? filterValue
        : [filterValue];

      return searchTerms.some((term) =>
        itemString.toLowerCase().includes(term.toLowerCase())
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "variant.name",
    header: "Nama Varian",
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const badgeOptions = stockMutationTypeToBadge(row.original.type);
      return <Badge variant={badgeOptions.variant}>{badgeOptions.label}</Badge>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Jumlah",
    cell: ({ row }) => {
      const { quantity, unitConversion } = row.original;
      return (
        <div>
          {quantity} {unitConversion.fromUnit}
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Catatan",
    cell: ({ row }) => {
      const { source, note } = row.original;
      if (!source) return "-";
      return (
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium">{source}</h1>
          {note && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{note}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      return <div>{formatDate(row.original.createdAt)}</div>;
    },
    filterFn: (row, _id, filterValue) => {
      const date = new Date(filterValue as string);
      return row.original.createdAt.toDateString() === date.toDateString();
    },
  },
];

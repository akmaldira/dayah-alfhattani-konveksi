"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionWithAllRelations } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { ItemDetailDialog } from "../item-detail-dialog";
import { ExpenseColumnAction } from "./columns-action";

export const columns: ColumnDef<TransactionWithAllRelations>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID Transaksi",
    cell: ({ row }) => row.original.id.slice(0, 3) + "...",
    filterFn: (row, _id, filterValue) => {
      const itemString = [
        row.original.source,
        row.original.note,
        ...row.original.items.map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ");

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
    accessorKey: "source",
    header: "Supplier",
    cell: ({ row }) => {
      const { source } = row.original;
      if (!source) return "-";
      return <div>{source}</div>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Harga",
    cell: ({ row }) => {
      return <div>{formatCurrency(row.original.totalAmount)}</div>;
    },
  },
  {
    id: "detail",
    header: "Detail",
    cell: ({ row }) => {
      return (
        <ItemDetailDialog
          transactionItems={row.original.items}
          type={row.original.type}
        />
      );
    },
  },
  {
    accessorKey: "note",
    header: "Catatan",
    cell: ({ row }) => {
      const { note } = row.original;
      if (!note) return "-";
      return (
        <div className="flex items-center gap-2">
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
  },
  {
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const transaction = row.original;
      return <ExpenseColumnAction transaction={transaction} />;
    },
  },
];

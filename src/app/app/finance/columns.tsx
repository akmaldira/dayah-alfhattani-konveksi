"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCurrency,
  formatDate,
  transactionTypeToBadge,
} from "@/lib/utils";
import { CashAuditLogWithRelations } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { ItemDetailDialog } from "./item-detail-dialog";

export const columns: ColumnDef<CashAuditLogWithRelations>[] = [
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.original.type;
      const config = transactionTypeToBadge(type);
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "amount",
    header: "Jumlah",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <>
          {type === "INCOME" ? "+" : type === "EXPENSE" ? "-" : "±"}
          {formatCurrency(row.original.amount)}
        </>
      );
    },
  },
  {
    accessorKey: "previousBalance",
    header: "Saldo Sebelum",
    cell: ({ row }) => {
      return <div>{formatCurrency(row.original.previousBalance)}</div>;
    },
  },
  {
    accessorKey: "nextBalance",
    header: "Saldo Setelah",
    cell: ({ row }) => {
      return <div>{formatCurrency(row.original.nextBalance)}</div>;
    },
  },
  {
    accessorKey: "note",
    header: "Catatan",
    cell: ({ row }) => {
      const { note } = row.original;
      return note ? (
        <Tooltip>
          <TooltipTrigger>
            <Info className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{note}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div>-</div>
      );
    },
  },
  {
    accessorKey: "transaction",
    header: "Transaksi",
    cell: ({ row }) => {
      return row.original.transaction ? (
        <ItemDetailDialog
          transactionItems={row.original.transaction.items}
          type={row.original.transaction.type}
        />
      ) : (
        "-"
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
];

"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionWithRelations } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { IncomeColumnAction } from "./columns-action";

export const createColumns = (): ColumnDef<TransactionWithRelations>[] => {
  return [
    {
      accessorKey: "source",
      header: "Pemasukan",
      cell: ({ row }) => {
        return <div>{row.original.source}</div>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        return <div>{formatCurrency(row.original.totalAmount)}</div>;
      },
    },
    {
      accessorKey: "note",
      header: "Keterangan",
      cell: ({ row }) => {
        if (!row.original.note) return "-";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="p-0">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.original.note}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        return <IncomeColumnAction transaction={row.original} />;
      },
    },
  ];
};

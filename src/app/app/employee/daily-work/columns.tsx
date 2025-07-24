"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Employee } from "@/lib/prisma/generated";
import { formatDate } from "@/lib/utils";
import { DailyWorkWithRelations } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { Info, MoreHorizontal } from "lucide-react";
import { UpsertDailyWorkDialog } from "./upsert-daily-work-dialog";

export const createColumns: (
  employees: Employee[]
) => ColumnDef<DailyWorkWithRelations>[] = (employees) => [
  {
    accessorKey: "employee.name",
    header: "Karyawan",
  },
  {
    accessorKey: "name",
    header: "Nama Pekerjaan",
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => {
      if (!row.original.description) return "-";
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="p-0">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.description}</p>
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
      const dailyWork = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dailyWork.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer border">
              <UpsertDailyWorkDialog
                className="hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                dailyWork={dailyWork}
                employees={employees}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

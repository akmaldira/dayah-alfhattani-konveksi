"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { employeeAttendanceStatusToBadge, formatDate } from "@/lib/utils";
import {
  EmployeeAttendanceWithRelations,
  EmployeeWithRelations,
} from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import UpsertAttendanceDialog from "./upsert-attendance-dialog";

export const createColumns: (
  employees: EmployeeWithRelations[]
) => ColumnDef<EmployeeAttendanceWithRelations>[] = (employees) => [
  {
    accessorKey: "employee.name",
    header: "Nama",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const attendance = row.original;
      const config = employeeAttendanceStatusToBadge(attendance.status);
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => {
      const attendance = row.original;
      return formatDate(attendance.date);
    },
    filterFn: (row, _id, filterValue) => {
      const date = new Date(filterValue as string);
      return row.original.date.toDateString() === date.toDateString();
    },
  },
  {
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const attendance = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{attendance.employee.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer border">
              <UpsertAttendanceDialog
                className="hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                attendance={attendance}
                employees={employees}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

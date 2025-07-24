"use client";

import { getEmployeesAction } from "@/action/employee-action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionWithAllRelations } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MoreHorizontal } from "lucide-react";
import React from "react";
import { DeleteSalaryDialog } from "./delete-salary-dialog";
import { UpsertSalaryDialog } from "./upsert-salary-dialog";

export function EmployeeLoanColumnAction({
  transaction,
}: {
  transaction: TransactionWithAllRelations;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await getEmployeesAction();
      if (response.status === "success") {
        return response.data;
      }
      return [];
    },
  });

  if (employeesQuery.isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (employeesQuery.isError) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  if (!employeesQuery.data) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer border">
          <UpsertSalaryDialog
            className="hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            transaction={transaction}
            employees={employeesQuery.data}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer border">
          <DeleteSalaryDialog
            transaction={transaction}
            className="hover:bg-accent  hover:text-destructive data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

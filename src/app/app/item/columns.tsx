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
import { ItemWithRelations } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PencilIcon } from "lucide-react";
import Link from "next/link";
import { UpsertVariantDialog } from "./upsert-variant-dialog";

export const columns: ColumnDef<ItemWithRelations>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    filterFn: (row, _id, filterValues) => {
      const itemString = [
        row.original.name,
        ...row.original.variants.map((variant) => variant.name),
      ]
        .filter(Boolean)
        .join(" ");

      const searchTerms = Array.isArray(filterValues)
        ? filterValues
        : [filterValues];

      return searchTerms.some((term) =>
        itemString.toLowerCase().includes(term.toLowerCase())
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "defaultUnit",
    header: "Satuan",
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{row.original.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer border">
              <Link href={`/app/item/${row.original.uniqueName}`}>
                <PencilIcon className="w-4 h-4" />
                Ubah Barang
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer border mt-1">
              <UpsertVariantDialog
                className="hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                item={row.original}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

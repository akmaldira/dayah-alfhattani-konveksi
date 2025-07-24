"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ItemWithRelations } from "@/types/prisma";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MoreHorizontal,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { DeleteVariantDialog } from "./delete-variant-dialog";
import PrintItem from "./print-item";
import { UpsertVariantDialog } from "./upsert-variant-dialog";

export function DataTable({
  columns,
  data,
}: {
  columns: ColumnDef<ItemWithRelations>[];
  data: ItemWithRelations[];
}) {
  const searchParams = useSearchParams();
  const [expandedItem, setExpandedItem] =
    React.useState<ItemWithRelations | null>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const router = useRouter();

  React.useEffect(() => {
    const expandedItem = searchParams.get("expandedItem");
    if (expandedItem) {
      const item = data.find((item) => item.uniqueName === expandedItem);
      if (item) {
        setExpandedItem(item);
      }
    }
  }, [searchParams, data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  function onExpandRow(uniqueName: string) {
    if (expandedItem?.uniqueName === uniqueName) {
      router.push("/app/item");
      setExpandedItem(null);
      return;
    }

    const item = data.find((item) => item.uniqueName === uniqueName);
    if (item) {
      router.push(`/app/item?expandedItem=${uniqueName}`);
      setExpandedItem(item);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between">
        <Input
          placeholder="Cari barang"
          className="max-w-xs"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
        <div className="flex items-center gap-2">
          <PrintItem />
          <Link href="/app/item/create">
            <Button>
              <PlusIcon className="w-4 h-4" />
              Tambah Barang
            </Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-20 pl-6">#</TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(header.id == "actions" && "w-32")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(expandedItem ? "hover:bg-transparent" : "")}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onExpandRow(row.original.uniqueName)}
                      >
                        {row.original.uniqueName ===
                        expandedItem?.uniqueName ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedItem &&
                    row.original.uniqueName === expandedItem.uniqueName && (
                      <React.Fragment key={row.id}>
                        {/* Sub Table Header */}
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell className="bg-background"></TableCell>
                          <TableCell className="font-bold border-y-4 border-l-4">
                            Variant {expandedItem.name}
                          </TableCell>
                          <TableCell className="font-bold border-y-4">
                            Stok Saat Ini
                          </TableCell>
                          <TableCell className="font-bold border-y-4 border-r-4">
                            Aksi
                          </TableCell>
                        </TableRow>
                        {/* Sub Table Body */}
                        {expandedItem.variants.map((variant, index) => (
                          <TableRow
                            key={variant.id}
                            className={cn("bg-muted/50 hover:bg-muted/50")}
                          >
                            <TableCell className="bg-background"></TableCell>
                            <TableCell
                              className={cn(
                                "border-l-4",
                                expandedItem.variants.length - 1 === index &&
                                  "border-b-4"
                              )}
                            >
                              {variant.name}
                            </TableCell>
                            <TableCell
                              className={cn(
                                expandedItem.variants.length - 1 === index &&
                                  "border-b-4"
                              )}
                            >
                              {variant.currentStock} {variant.unit}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "border-r-4",
                                expandedItem.variants.length - 1 === index &&
                                  "border-b-4"
                              )}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    {row.original.name} - {variant.name}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer border mt-1"
                                  >
                                    <UpsertVariantDialog
                                      className="hover:bg-accent hover:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                      item={row.original}
                                      variant={variant}
                                    />
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer border mt-1"
                                  >
                                    <DeleteVariantDialog
                                      className="focus:text-destructive"
                                      item={row.original}
                                      variant={variant}
                                    />
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  Tidak ada barang.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

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

import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stockMutationTypeToBadge } from "@/lib/utils";
import { ItemWithRelations } from "@/types/prisma";
import { MinusIcon } from "lucide-react";
import React from "react";
import { AddStockDialog } from "../in/add-stock-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  uniqueItemNames: string[];
  items: ItemWithRelations[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  uniqueItemNames,
  items,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-col-reverse md:flex-row justify-between">
        <div className="flex items-center flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Cari"
              className="w-[150px]"
              value={
                (table.getColumn("item")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("item")?.setFilterValue(event.target.value)
              }
            />
            <Select
              onValueChange={(value) => {
                if (value === "ALL") {
                  table.getColumn("item")?.setFilterValue(undefined);
                } else {
                  table.getColumn("item")?.setFilterValue(value);
                }
              }}
              defaultValue={
                (table.getColumn("item")?.getFilterValue() as string) ?? ""
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nama Barang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                {uniqueItemNames.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) => {
                if (value === "ALL") {
                  table.getColumn("type")?.setFilterValue(undefined);
                } else {
                  table.getColumn("type")?.setFilterValue(value);
                }
              }}
              defaultValue={
                (table.getColumn("type")?.getFilterValue() as string) ?? ""
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipe Perubahan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="IN">
                  {stockMutationTypeToBadge("IN").label}
                </SelectItem>
                <SelectItem value="OUT">
                  {stockMutationTypeToBadge("OUT").label}
                </SelectItem>
                <SelectItem value="ADJUSTMENT">
                  {stockMutationTypeToBadge("ADJUSTMENT").label}
                </SelectItem>
              </SelectContent>
            </Select>
            <DateTimePicker
              className="w-[150px]"
              value={
                table.getColumn("createdAt")?.getFilterValue()
                  ? new Date(
                      table.getColumn("createdAt")?.getFilterValue() as string
                    )
                  : undefined
              }
              onValueChange={(date) => {
                if (date) {
                  table
                    .getColumn("createdAt")
                    ?.setFilterValue(date.toISOString());
                } else {
                  table.getColumn("createdAt")?.setFilterValue(undefined);
                }
              }}
            />
          </div>
        </div>
        {/* <UpsertStockMutationDialog /> */}
        <div className="flex items-center flex-col gap-2">
          <Button variant="destructive" disabled>
            <MinusIcon className="w-4 h-4" />
            Barang Keluar
          </Button>
          <AddStockDialog items={items} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada riwayat stok.
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

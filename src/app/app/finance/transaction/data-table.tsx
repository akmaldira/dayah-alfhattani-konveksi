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
import Link from "next/link";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
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
              placeholder="Cari transaksi"
              className="w-[300px]"
              value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("id")?.setFilterValue(event.target.value)
              }
            />
            {/* <Select
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
                <SelectValue placeholder="Tipe Transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="ADJUSTMENT">Perubahan</SelectItem>
              </SelectContent>
            </Select> */}
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
                <SelectValue placeholder="Tipe Transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="ADJUSTMENT">Perubahan</SelectItem>
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
        <div className="flex items-center flex-col gap-2">
          <Link href="/app/finance/expense/create">
            <Button variant="destructive">Tambah Pengeluaran</Button>
          </Link>
          <Link href="/app/finance/income/create">
            <Button>Tambah Pemasukan</Button>
          </Link>
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
                  Tidak ada data.
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

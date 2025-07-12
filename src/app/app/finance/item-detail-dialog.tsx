"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionItem, TransactionType } from "@/lib/prisma/generated";
import { formatCurrency } from "@/lib/utils";
import { Info } from "lucide-react";
import React from "react";

export function ItemDetailDialog({
  transactionItems,
  type,
}: {
  transactionItems: TransactionItem[];
  type: TransactionType;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Info className="size-4" />
          Lihat Detail
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Detail{" "}
            {type == "EXPENSE"
              ? "Pengeluaran"
              : type == "INCOME"
              ? "Pemasukan"
              : "Perubahan"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Table>
          <TableCaption></TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">
                Nama{" "}
                {type == "EXPENSE"
                  ? "Pengeluaran"
                  : type == "INCOME"
                  ? "Pemasukan"
                  : "Perubahan"}
              </TableHead>
              <TableHead className="font-bold">Jumlah</TableHead>
              <TableHead className="text-right font-bold">Harga</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.totalPrice)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold" colSpan={2}>
                Total Harga
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(
                  transactionItems.reduce(
                    (acc, item) => acc + item.totalPrice,
                    0
                  )
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

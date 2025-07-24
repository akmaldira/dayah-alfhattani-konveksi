"use client";

import { deleteExpenseAction } from "@/action/transaction-action";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, handleActionResponse } from "@/lib/utils";
import {
  deleteTransactionSchema,
  DeleteTransactionSchema,
} from "@/schema/transaction-schema";
import { TransactionWithAllRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function DeleteExpenseDialog({
  transaction,
  className,
}: {
  transaction: TransactionWithAllRelations;
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<DeleteTransactionSchema>({
    resolver: zodResolver(deleteTransactionSchema),
    defaultValues: {
      action: "delete",
      id: transaction.id,
    },
  });

  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  function onSubmit(values: DeleteTransactionSchema) {
    startTransition(async () => {
      const response = await deleteExpenseAction(values);
      const data = handleActionResponse(response);
      if (data) {
        setDialogOpen(false);
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className={cn(className, "w-full text-destructive")}>
        <TrashIcon className="w-4 h-4 text-destructive" />
        Hapus Pengeluaran
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Pengeluaran</DialogTitle>
          <DialogDescription>
            Aksi ini akan menghapus pengeluaran ini, saldo akan dikembalikan ke
            kas. Stok barang akan dikurangi sesuai dengan jumlah item yang
            dibeli.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Pengeluaran</FormLabel>
                  <FormControl>
                    <Input placeholder="ID Pengeluaran" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Item</h4>
              <ul className="list-disc pl-4">
                {transaction.items.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm">
                      {item.mutation
                        ? `${item.mutation.variant.item.name} - ${
                            item.mutation.variant.name
                          } (${item.mutation.quantity} ${
                            item.mutation.unitConversion.fromUnit
                          }) ${formatCurrency(item.totalPrice)}`
                        : `${item.name} ${formatCurrency(item.totalPrice)}`}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Supplier</h4>
              <Input disabled value={transaction.source || ""} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Jumlah Pengeluaran</h4>
              <Input disabled value={formatCurrency(transaction.totalAmount)} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Catatan</h4>
              <Textarea disabled value={transaction.note ?? ""} />
            </div>
            <Button
              variant="destructive"
              type="submit"
              disabled={isPending}
              loading={isPending}
              className="w-full"
            >
              Hapus
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

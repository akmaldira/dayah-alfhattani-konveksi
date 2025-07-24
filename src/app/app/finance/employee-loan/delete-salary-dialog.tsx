"use client";

import { deleteSalaryAction } from "@/action/salary-action";
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
import { deleteSalarySchema, DeleteSalarySchema } from "@/schema/salary-schema";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function DeleteSalaryDialog({
  transaction,
  className,
}: {
  transaction: EmployeeSalaryTransaction;
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<DeleteSalarySchema>({
    resolver: zodResolver(deleteSalarySchema),
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

  function onSubmit(values: DeleteSalarySchema) {
    startTransition(async () => {
      const response = await deleteSalaryAction(values);
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
        Hapus Ambilan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Ambilan Karyawan</DialogTitle>
          <DialogDescription>
            Aksi ini akan menghapus ambilan karyawan ini, saldo akan
            dikembalikan ke kas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Karyawan</h4>
              <Input disabled value={transaction.items[0].employee?.name} />
            </div>
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Ambilan Karyawan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID Ambilan Karyawan"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Jumlah Ambilan</h4>
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

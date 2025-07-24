"use client";

import { upsertSalaryAction } from "@/action/salary-action";
import { Combobox } from "@/components/combobox";
import { MoneyInputForm } from "@/components/money-input-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Employee } from "@/lib/prisma/generated";
import { cn, handleActionResponse } from "@/lib/utils";
import { upsertSalarySchema, UpsertSalarySchema } from "@/schema/salary-schema";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function UpsertSalaryDialog({
  className,
  transaction,
  employees,
}: {
  className?: string;
  transaction?: EmployeeSalaryTransaction;
  employees: Employee[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<UpsertSalarySchema>({
    resolver: zodResolver(upsertSalarySchema),
    defaultValues: transaction
      ? {
          action: "update",
          id: transaction.id,
          totalAmount: transaction.totalAmount,
          note: transaction.note ?? "",
          employeeId: transaction.items[0].employee?.id ?? "",
        }
      : {
          action: "create",
          totalAmount: 0,
          note: "",
          employeeId: "",
        },
  });

  function onSubmit(values: UpsertSalarySchema) {
    startTransition(async () => {
      const response = await upsertSalaryAction(values);
      const data = handleActionResponse(response);
      if (data) {
        setDialogOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        asChild={!transaction}
        className={cn(className, transaction && "w-full")}
      >
        {transaction ? (
          <>
            <Pencil className="h-4 w-4" />
            <span>Edit Ambilan</span>
          </>
        ) : (
          <Button>
            <PlusIcon className="size-4" />
            Tambah Ambilan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? `Edit Ambilan` : "Tambah Ambilan"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? `Edit Ambilan ${transaction.items[0].employee?.name}`
              : "Tambahkan ambilan untuk karyawan"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Karyawan</FormLabel>
                  <FormControl>
                    <Combobox
                      placeholder="Pilih karyawan"
                      options={employees.map((employee) => ({
                        id: employee.id,
                        label: employee.name,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <MoneyInputForm
              form={form}
              label="Jumlah"
              name="totalAmount"
              placeholder="Masukkan jumlah ambilan"
              required
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              className="w-full"
            >
              Simpan
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

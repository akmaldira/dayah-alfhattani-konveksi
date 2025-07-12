"use client";

import { upsertCashAction } from "@/action/transaction-action";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { handleActionResponse } from "@/lib/utils";
import {
  upsertCashSchema,
  UpsertCashSchema,
} from "@/schema/transaction-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

export function UpsertCashDialog({ type }: { type: "increase" | "decrease" }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<UpsertCashSchema>({
    resolver: zodResolver(upsertCashSchema),
    defaultValues: {
      action: type,
      amount: 0,
      note: "",
    },
  });

  function onSubmit(values: UpsertCashSchema) {
    startTransition(async () => {
      const response = await upsertCashAction(values);
      const data = handleActionResponse(response);
      if (data) {
        setDialogOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={type === "increase" ? "default" : "destructive"}>
          {type === "increase" ? "Tambah Saldo" : "Kurangi Saldo"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "increase" ? "Tambah Saldo Kas" : "Kurangi Saldo Kas"}
          </DialogTitle>
          <DialogDescription>
            {type === "increase"
              ? "Tambah saldo ke kas. Penambahan ini akan tercatat sebagai perubahan saldo."
              : "Kurangi saldo dari kas. Penurunan ini akan tercatat sebagai perubahan saldo."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <MoneyInputForm
              form={form}
              name="amount"
              label="Jumlah"
              placeholder="Jumlah saldo"
              required
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan perubahan saldo"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Catatan perubahan saldo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              loading={isPending}
              className="w-full"
              variant={type === "increase" ? "default" : "destructive"}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

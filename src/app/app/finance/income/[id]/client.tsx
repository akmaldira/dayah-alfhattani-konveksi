"use client";

import { createIncomeAction } from "@/action/transaction-action";
import { MoneyInputForm } from "@/components/money-input-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrency,
  handleActionResponse,
  transactionToUpdateTransaction,
} from "@/lib/utils";
import {
  CreateTransactionItemSchema,
  upsertTransactionSchema,
  UpsertTransactionSchema,
} from "@/schema/transaction-schema";
import { TransactionWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function IncomeByIdClient({
  income,
}: {
  income?: TransactionWithRelations;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const router = useRouter();
  const form = useForm<UpsertTransactionSchema>({
    resolver: zodResolver(upsertTransactionSchema),
    defaultValues: income
      ? transactionToUpdateTransaction(income)
      : {
          action: "create",
          source: "",
          note: "",
          items: [
            {
              type: "item",
              name: "",
              quantity: 1,
              supplier: "",
              totalPrice: 0,
            },
          ] as CreateTransactionItemSchema[],
        },
  });

  function onSubmit(values: UpsertTransactionSchema) {
    startTransition(async () => {
      if (income) {
        toast.error("Fitur belum tersedia");
      } else {
        const response = await createIncomeAction(values);
        handleActionResponse(response);
      }
    });
  }

  const formItems = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {income ? `Ubah Pemasukan ${income.id}` : "Tambah Pemasukan"}
          </CardTitle>
          <CardDescription>
            Pastikan semua data sudah benar sebelum menyimpan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nama Pemasukan</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Pemasukan" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nama pemasukan e.g., Penjualan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    const someItem = form
                      .getValues("items")
                      .some((item) => item.type === "itemWithVariant");
                    if (someItem) {
                      formItems.append({
                        type: "itemWithVariant",
                        name: "",
                        quantity: 1,
                        supplier: "",
                        totalPrice: 0,
                        itemId: "",
                        variantId: "",
                        unitId: "",
                        appendToStock: true,
                      });
                    } else {
                      formItems.append({
                        type: "item",
                        name: "",
                        quantity: 1,
                        supplier: "",
                        totalPrice: 0,
                      });
                    }
                  }}
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Item
                </Button>
              </div>
              <Table>
                <TableCaption>
                  {form.formState.errors.items?.message ? (
                    <p className="text-red-500">
                      {form.formState.errors.items.message}
                    </p>
                  ) : (
                    "List pemasukan"
                  )}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead className="space-x-1">
                      <span>Nama</span>
                      <span className="text-red-500">*</span>
                    </TableHead>
                    <TableHead className="space-x-1">
                      <span>Jumlah</span>
                      <span className="text-red-500">*</span>
                    </TableHead>
                    <TableHead className="space-x-1">
                      <span>Total Harga</span>
                      <span className="text-red-500">*</span>
                    </TableHead>
                    <TableHead className="w-16">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formItems.fields.map((field, index) => {
                    return (
                      <TableRow key={field.id}>
                        <TableCell className="align-top">{index + 1}</TableCell>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Nama item" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Jumlah"
                                    {...field}
                                    type="number"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <MoneyInputForm
                            form={form}
                            name={`items.${index}.totalPrice`}
                            placeholder="Total Harga"
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <Button
                            variant="destructive"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => formItems.remove(index)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold" colSpan={3}>
                      Total Pemasukan
                    </TableCell>
                    <TableCell>
                      <Input
                        value={formatCurrency(
                          form
                            .watch("items")
                            .reduce((acc, item) => acc + item.totalPrice, 0)
                        )}
                        disabled
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Catatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={isPending || !form.formState.isValid}
                      loading={isPending}
                    >
                      Simpan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Simpan Pemasukan</DialogTitle>
                      <DialogDescription>
                        Pastikan semua data sudah benar sebelum menyimpan,
                        karena aksi ini tidak dapat diubah
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={() => form.handleSubmit(onSubmit)()}
                        disabled={isPending}
                        loading={isPending}
                      >
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

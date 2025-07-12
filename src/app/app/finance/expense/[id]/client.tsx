"use client";

import { createExpenseAction } from "@/action/transaction-action";
import { Combobox } from "@/components/combobox";
import { MoneyInputForm } from "@/components/money-input-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { ItemWithRelations, TransactionWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";

function calculateQuantityToDefaultUnit(
  item?: ItemWithRelations,
  quantity?: number,
  unit?: string
) {
  if (!item || !quantity || !unit) return "N/A";
  const conversion = item.conversions.find(
    (conversion) => conversion.id === unit
  );
  if (!conversion) return quantity;
  return `${conversion.multiplier * quantity} ${item.defaultUnit}`;
}

export default function ExpenseByIdClient({
  expense,
  items,
}: {
  expense?: TransactionWithRelations;
  items: ItemWithRelations[];
}) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const form = useForm<UpsertTransactionSchema>({
    resolver: zodResolver(upsertTransactionSchema),
    defaultValues: expense
      ? transactionToUpdateTransaction(expense)
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
      const response = await createExpenseAction(values);
      handleActionResponse(response);
    });
  }

  const formItems = useFieldArray({
    control: form.control,
    name: "items",
  });
  const watchItems = form.watch("items");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {expense ? `Ubah Pengeluaran ${expense.id}` : "Tambah Pengeluaran"}
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
                    <FormLabel>Supplier (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier" {...field} />
                    </FormControl>
                    <FormDescription>
                      Supplier dari pembelian barang
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
                    "List pengeluaran"
                  )}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Barang?</TableHead>
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
                    const formItem = watchItems[index];
                    return (
                      <TableRow key={field.id}>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name="items"
                            render={() => (
                              <FormItem className="w-10 mt-2">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.type`}
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-center gap-2">
                                        <FormControl>
                                          <Checkbox
                                            checked={
                                              field.value === "itemWithVariant"
                                            }
                                            onCheckedChange={(checked) => {
                                              field.onChange(
                                                checked
                                                  ? "itemWithVariant"
                                                  : "item"
                                              );
                                              if (!checked) {
                                                form.resetField(
                                                  `items.${index}.itemId`
                                                );
                                                form.resetField(
                                                  `items.${index}.variantId`
                                                );
                                                form.resetField(
                                                  `items.${index}.unitId`
                                                );
                                                form.resetField(
                                                  `items.${index}.quantity`
                                                );
                                                form.resetField(
                                                  `items.${index}.totalPrice`
                                                );
                                              } else {
                                                form.setValue(
                                                  `items.${index}.appendToStock`,
                                                  true
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    );
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          {formItem.type === "itemWithVariant" ? (
                            <div className="flex flex-row gap-2 w-full">
                              <FormField
                                control={form.control}
                                name={`items.${index}.itemId`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <Combobox
                                        placeholder="Pilih Barang"
                                        options={items.map((item) => ({
                                          id: item.id,
                                          label: item.name,
                                        }))}
                                        value={field.value}
                                        onValueChange={(value) => {
                                          form.setValue(
                                            `items.${index}.variantId`,
                                            ""
                                          );
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`items.${index}.variantId`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <Combobox
                                        placeholder="Pilih Varian"
                                        options={
                                          items
                                            .find(
                                              (item) =>
                                                item.id === formItem.itemId
                                            )
                                            ?.variants.map((variant) => ({
                                              id: variant.id,
                                              label: variant.name,
                                            })) ?? []
                                        }
                                        value={field.value}
                                        onValueChange={(variantId) => {
                                          field.onChange(variantId);
                                          const variant = items
                                            .find(
                                              (item) =>
                                                item.id === formItem.itemId
                                            )
                                            ?.variants.find(
                                              (variant) =>
                                                variant.id === variantId
                                            );
                                          if (variant) {
                                            form.setValue(
                                              `items.${index}.name`,
                                              variant.name
                                            );
                                          }
                                        }}
                                        disabled={!formItem.itemId}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : (
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
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {formItem.type === "itemWithVariant" ? (
                            <div className="flex flex-row gap-2 w-full">
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem className="w-32">
                                    <FormControl>
                                      <Input
                                        placeholder="Jumlah"
                                        {...field}
                                        type="number"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`items.${index}.unitId`}
                                render={({ field }) => (
                                  <FormItem className="w-full max-w-[200px]">
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      disabled={!formItem.itemId}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Pilih Satuan" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {items
                                          .find(
                                            (item) =>
                                              item.id === formItem.itemId
                                          )
                                          ?.conversions.map((conversion) => (
                                            <SelectItem
                                              key={conversion.id}
                                              value={conversion.id}
                                            >
                                              {conversion.fromUnit}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Input
                                value={calculateQuantityToDefaultUnit(
                                  items.find(
                                    (item) => item.id === formItem.itemId
                                  ),
                                  formItem.quantity,
                                  formItem.unitId
                                )}
                                disabled
                                className="w-[150px]"
                              />
                            </div>
                          ) : (
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
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {formItem.type === "itemWithVariant" ? (
                            <div className="flex flex-row gap-2 justify-between items-start w-full">
                              <MoneyInputForm
                                form={form}
                                name={`items.${index}.totalPrice`}
                                placeholder="Total Harga"
                                className="w-full min-w-[150px]"
                              />
                              <FormField
                                control={form.control}
                                name={`items.${index}.appendToStock`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center gap-2">
                                    <FormLabel>Tambah ke stok</FormLabel>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : (
                            <MoneyInputForm
                              form={form}
                              name={`items.${index}.totalPrice`}
                              placeholder="Total Harga"
                            />
                          )}
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
                      Total Pengeluaran
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
                <Button type="submit" disabled={isPending} loading={isPending}>
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

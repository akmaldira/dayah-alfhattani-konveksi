"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addStockSchema, AddStockSchema } from "@/schema/variant-schema";
import { ItemWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function AddStockDialog({
  items,
  className,
}: {
  items: ItemWithRelations[];
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<AddStockSchema>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      action: "add",
      _id: "",
      itemId: "",
      unitId: "",
      quantity: 0,
      note: "",
    },
  });

  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  function onSubmit(values: AddStockSchema) {
    startTransition(async () => {
      console.log(values);
    });
  }

  const watch = form.watch();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className={cn(className)} asChild>
        <Button>
          <PlusIcon className="w-4 h-4" />
          Barang Masuk
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Barang Masuk</DialogTitle>
          <DialogDescription>
            Pastikan nama varian dan stok yang akan ditambahkan sudah sesuai
            dengan data yang ada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Barang</FormLabel>
                  <FormControl>
                    <Combobox
                      placeholder="Pilih Barang"
                      options={items.map((item) => ({
                        id: item.id,
                        label: item.name,
                      }))}
                      value={field.value}
                      onValueChange={(value) => {
                        form.setValue("_id", "");
                        form.setValue("unitId", "");
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
              name="_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Varian</FormLabel>
                  <FormControl>
                    <Combobox
                      placeholder="Pilih Varian"
                      disabled={!watch.itemId}
                      options={
                        items
                          .find((item) => item.id === watch.itemId)
                          ?.variants.map((variant) => ({
                            id: variant.id,
                            label: variant.name,
                          })) ?? []
                      }
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 w-full">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel required>Jumlah Berdasarkan Satuan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jumlah Berdasarkan Satuan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Satuan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!watch.itemId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Satuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {items
                          .find((item) => item.id === watch.itemId)
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
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Tambah Ke Pengeluaran</FormLabel>
                    <FormDescription>
                      Jika dipilih, barang ini akan dicatat di pengeluaran.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "addWithOrder"}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? "addWithOrder" : "add");
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {watch.action === "addWithOrder" && (
              <>
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier (Opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Supplier"
                          {...field}
                          disabled={!watch.itemId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <MoneyInputForm
                  form={form}
                  label="Harga Total"
                  required
                  name="totalPrice"
                  placeholder="Harga Total"
                  disabled={!watch.itemId}
                />
              </>
            )}
            <Button
              type="submit"
              disabled={isPending}
              loading={isPending}
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

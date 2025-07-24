"use client";

import { removeStockAction } from "@/action/variant-action";
import { Combobox } from "@/components/combobox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, handleActionResponse } from "@/lib/utils";
import { removeStockSchema, RemoveStockSchema } from "@/schema/variant-schema";
import { ItemWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function RemoveStockDialog({
  items,
  className,
}: {
  items: ItemWithRelations[];
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<RemoveStockSchema>({
    resolver: zodResolver(removeStockSchema),
    defaultValues: {
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

  function onSubmit(values: RemoveStockSchema) {
    startTransition(async () => {
      const response = await removeStockAction(values);
      const data = handleActionResponse(response);
      if (data) {
        setDialogOpen(false);
      }
    });
  }

  const watch = form.watch();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className={cn(className)} asChild>
        <Button variant="destructive">
          <MinusIcon className="w-4 h-4" />
          Barang Keluar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pengeluaran Barang</DialogTitle>
          <DialogDescription>
            Pastikan nama varian dan stok yang akan dikeluarkan sudah sesuai
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

"use client";

import { upsertVariantAction } from "@/action/variant-action";
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
import { Item, Variant } from "@/lib/prisma/generated";
import { cn, handleActionResponse } from "@/lib/utils";
import {
  UpsertVariantWithItemIdSchema,
  upsertVariantWithItemIdSchema,
} from "@/schema/variant-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function UpsertVariantDialog({
  item,
  variant,
  className,
}: {
  item: Item;
  variant?: Variant;
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<UpsertVariantWithItemIdSchema>({
    resolver: zodResolver(upsertVariantWithItemIdSchema),
    defaultValues: variant
      ? {
          action: "update",
          _id: variant.id,
          name: variant.name,
          currentStock: variant.currentStock,
          itemId: item.id,
        }
      : {
          action: "create",
          name: "",
          currentStock: 0,
          itemId: item.id,
        },
  });

  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  function onSubmit(values: UpsertVariantWithItemIdSchema) {
    startTransition(async () => {
      const response = await upsertVariantAction(values);
      const data = handleActionResponse(response);
      if (data) {
        setDialogOpen(false);
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className={cn(className, "w-full")}>
        {variant ? (
          <PencilIcon className="w-4 h-4" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
        {variant ? "Ubah" : "Tambah"} Varian
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{variant ? "Ubah" : "Tambah"} Varian</DialogTitle>
          <DialogDescription>
            Pastikan nama varian dan stok yang akan{" "}
            {variant ? "diubah" : "ditambahkan"} sudah sesuai dengan data yang
            ada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Barang</h4>
              <Input disabled value={item.name} />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nama Varian</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Varian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Stok Saat Ini</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Stok Saat Ini"
                        {...field}
                        type="number"
                      />
                      <span className="absolute right-10 top-1/2 -translate-y-1/2">
                        {item.defaultUnit}
                      </span>
                    </div>
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

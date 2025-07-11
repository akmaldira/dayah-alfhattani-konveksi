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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StockMutation } from "@/lib/prisma/generated";
import {
  upsertStockMutationSchema,
  UpsertStockMutationSchema,
} from "@/schema/stock-mutation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function UpsertStockMutationDialog({
  stockMutation,
}: {
  stockMutation?: StockMutation;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<UpsertStockMutationSchema>({
    resolver: zodResolver(upsertStockMutationSchema),
    defaultValues: stockMutation
      ? {
          action: "update",
          id: stockMutation.id,
          variantId: stockMutation.variantId,
          type: stockMutation.type,
          quantity: stockMutation.quantity,
          source: stockMutation.source ?? "",
          note: stockMutation.note ?? "",
        }
      : {
          action: "create",
          variantId: "",
          type: "IN",
          quantity: 0,
          source: "",
          note: "",
        },
  });

  function onSubmit(values: UpsertStockMutationSchema) {
    startTransition(async () => {
      console.log(values);
      toast.error("Not implemented");
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild={!stockMutation}>
        {stockMutation ? (
          <>
            <PencilIcon className="w-4 h-4" />
            Ubah
          </>
        ) : (
          <Button>
            <PlusIcon className="w-4 h-4" />
            Tambah Perubahan Stok
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {stockMutation ? "Ubah" : "Tambah"} Perubahan Stok
          </DialogTitle>
          <DialogDescription>
            Pastikan data yang Anda masukkan sudah benar. Aksi ini tidak dapat
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input placeholder="10" {...field} />
                  </FormControl>
                  <FormDescription>Jumlah perubahan stok</FormDescription>
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

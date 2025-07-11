"use client";

import { deleteVariantAction } from "@/action/variant-action";
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
  DeleteVariantWithItemIdSchema,
  deleteVariantWithItemIdSchema,
} from "@/schema/variant-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function DeleteVariantDialog({
  item,
  variant,
  className,
}: {
  item: Item;
  variant: Variant;
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<DeleteVariantWithItemIdSchema>({
    resolver: zodResolver(deleteVariantWithItemIdSchema),
    defaultValues: {
      action: "delete",
      _id: variant.id,
      itemId: item.id,
    },
  });

  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  function onSubmit(values: DeleteVariantWithItemIdSchema) {
    startTransition(async () => {
      const response = await deleteVariantAction(values);
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
        Hapus Varian
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Varian</DialogTitle>
          <DialogDescription>
            Aksi ini akan menghapus varian dari barang tersebut, dan tidak akan
            bisa dikembalikan lagi.
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
              name="_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Varian</FormLabel>
                  <FormControl>
                    <Input placeholder="ID Varian" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Nama Varian</h4>
              <Input disabled value={variant.name} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Stok Saat Ini</h4>
              <Input
                disabled
                value={`${variant.currentStock} ${variant.unit}`}
              />
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

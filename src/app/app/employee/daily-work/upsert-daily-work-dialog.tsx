"use client";

import { upsertDailyWorkAction } from "@/action/daily-work-action";
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
import { Textarea } from "@/components/ui/textarea";
import { Employee } from "@/lib/prisma/generated";
import { cn, handleActionResponse } from "@/lib/utils";
import {
  UpsertDailyWorkSchema,
  upsertDailyWorkSchema,
} from "@/schema/daily-work-schema";
import { DailyWorkWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export function UpsertDailyWorkDialog({
  className,
  dailyWork,
  employees,
}: {
  className?: string;
  dailyWork?: DailyWorkWithRelations;
  employees: Employee[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<UpsertDailyWorkSchema>({
    resolver: zodResolver(upsertDailyWorkSchema),
    defaultValues: dailyWork
      ? {
          action: "update",
          id: dailyWork.id,
          name: dailyWork.name,
          description: dailyWork.description ?? "",
          employeeId: dailyWork.employeeId,
        }
      : {
          action: "create",
          name: "",
          description: "",
          employeeId: "",
        },
  });

  function onSubmit(values: UpsertDailyWorkSchema) {
    startTransition(async () => {
      const response = await upsertDailyWorkAction(values);
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
        asChild={!dailyWork}
        className={cn(className, dailyWork && "w-full")}
      >
        {dailyWork ? (
          <>
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </>
        ) : (
          <Button>
            <PlusIcon className="size-4" />
            Pekerjaan Harian
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dailyWork ? `Edit ${dailyWork.name}` : "Tambah Pekerjaan Harian"}
          </DialogTitle>
          <DialogDescription>
            {dailyWork
              ? `Edit pekerjaan harian ${dailyWork.name}`
              : "Tambahkan pekerjaan harian untuk karyawan"}
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nama Pekerjaan</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
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

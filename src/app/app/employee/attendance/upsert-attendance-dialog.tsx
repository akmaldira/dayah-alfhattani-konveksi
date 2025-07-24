"use client";

import { upsertAttendanceAction } from "@/action/employee-action";
import { Combobox } from "@/components/combobox";
import { DateTimePicker } from "@/components/date-time-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/lib/prisma/generated";
import { cn, handleActionResponse } from "@/lib/utils";
import {
  UpsertAttendanceSchema,
  upsertAttendanceSchema,
} from "@/schema/employee-schema";
import { EmployeeAttendanceWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { startOfDay } from "date-fns";
import { Pencil } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export default function UpsertAttendanceDialog({
  employees,
  attendance,
  className,
}: {
  employees: Employee[];
  attendance?: EmployeeAttendanceWithRelations;
  className?: string;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<UpsertAttendanceSchema>({
    resolver: zodResolver(upsertAttendanceSchema),
    defaultValues: attendance
      ? {
          id: attendance.id,
          action: "update",
          employeeId: attendance.employeeId,
          status: attendance.status,
          date: attendance.createdAt,
        }
      : {
          action: "create",
          employeeId: "",
          status: "PRESENT",
          date: new Date(),
        },
  });

  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  function onSubmit(values: UpsertAttendanceSchema) {
    startTransition(async () => {
      const response = await upsertAttendanceAction({
        ...values,
        date: startOfDay(values.date),
      });
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
        asChild={!attendance}
        className={cn(className, attendance && "w-full")}
      >
        {attendance ? (
          <>
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </>
        ) : (
          <Button>Tambah Kehadiran</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {attendance ? "Edit Kehadiran" : "Tambah Kehadiran"}
          </DialogTitle>
          <DialogDescription>
            {attendance
              ? "Edit kehadiran karyawan"
              : "Tambah kehadiran karyawan"}
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
                      placeholder="Pilih Karyawan"
                      options={employees.map((employee) => ({
                        id: employee.id,
                        label: employee.name,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tanggal</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full flex items-center justify-between"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel required>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRESENT">Hadir</SelectItem>
                      <SelectItem value="ABSENT">Tidak Hadir</SelectItem>
                      <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
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

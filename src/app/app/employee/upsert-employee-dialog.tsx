"use client";

import { upsertEmployeeAction } from "@/action/employee-action";
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
import { Switch } from "@/components/ui/switch";
import { cn, handleActionResponse } from "@/lib/utils";
import {
  upsertEmployeeSchema,
  UpsertEmployeeSchema,
} from "@/schema/employee-schema";
import { EmployeeWithRelations } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, Pencil } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export default function UpsertEmployeeDialog({
  employee,
  className,
}: {
  employee?: EmployeeWithRelations;
  className?: string;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = React.useState(false);
  const [withUser, setWithUser] = React.useState(employee?.user ? true : false);
  const form = useForm<UpsertEmployeeSchema>({
    resolver: zodResolver(upsertEmployeeSchema),
    defaultValues: employee
      ? {
          id: employee.id,
          action: "update",
          name: employee.name,
          email: employee.user?.email,
          password: "",
        }
      : {
          action: "create",
          name: "",
          email: "",
          password: "",
        },
  });

  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  function onSubmit(values: UpsertEmployeeSchema) {
    startTransition(async () => {
      const response = await upsertEmployeeAction(values);
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
        asChild={!employee}
        className={cn(className, employee && "w-full")}
      >
        {employee ? (
          <>
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </>
        ) : (
          <Button>Tambah Karyawan</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {employee ? `Edit ${employee.name}` : "Tambah Karyawan"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? `Edit karyawan ${employee.name}`
              : "Tambahkan karyawan baru ke dalam sistem."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nama</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium">Buat Akun?</h3>
                <p className="text-sm text-muted-foreground">
                  Jika dipilih, akun akan dibuat untuk karyawan ini.
                </p>
              </div>
              <Switch
                checked={withUser}
                onCheckedChange={(checked) => {
                  setWithUser(checked);
                }}
                disabled={!!employee?.user}
              />
            </div>
            {withUser && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          {...field}
                          type="email"
                          disabled={!!employee?.user}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeIcon className="w-4 h-4" />
                            ) : (
                              <EyeOffIcon className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
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

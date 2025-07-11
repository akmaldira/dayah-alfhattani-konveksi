"use client";

import { signInAction } from "@/action/auth-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleActionResponse } from "@/lib/utils";
import { SignInSchema, signInSchema } from "@/schema/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";

export default function SignInPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: SignInSchema) {
    startTransition(async () => {
      const response = await signInAction(values);
      console.log(response);
      handleActionResponse(response);
    });
  }

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="min-w-lg mt-32 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Masuk
          </CardTitle>
          <CardDescription className="text-center">
            Masuk menggunakan akun anda untuk mengakses layanan ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@mail.com" {...field} />
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
                      <div className="relative w-full">
                        <Input
                          placeholder="********"
                          {...field}
                          type={showPassword ? "text" : "password"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Eye /> : <EyeOff />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full">
                <Button
                  type="submit"
                  disabled={isPending}
                  loading={isPending}
                  className="w-full"
                >
                  Masuk
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/signup" className="text-primary">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

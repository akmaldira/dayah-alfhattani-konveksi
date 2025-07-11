"use server";

import { signIn, signOut } from "@/lib/auth";
import { hashPassword } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import { User } from "@/lib/prisma/generated";
import { SignInSchema, SignUpSchema } from "@/schema/auth-schema";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

export async function signInAction(
  values: SignInSchema
): Promise<ActionResponse<null>> {
  await signIn("credentials", {
    ...values,
    redirect: false,
  });

  revalidatePath("/signin");
  return {
    status: "success",
    data: null,
    redirect: "/app",
    message: "Berhasil masuk",
  };
}

export async function signUpAction(
  values: SignUpSchema
): Promise<ActionResponse<Omit<User, "password">>> {
  try {
    const isEmailExists = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (isEmailExists) {
      return {
        status: "error",
        error: {
          message: "Email sudah terdaftar",
        },
      };
    }

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        password: hashPassword(values.password),
      },
    });

    const { password, ...userData } = user;
    revalidatePath("/signup");

    return {
      status: "success",
      data: userData,
      message: "Berhasil mendaftar, silakan masuk",
      redirect: "/signin",
    };
  } catch (error: any) {
    console.error(`[signUpAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function signOutAction() {
  await signOut();
}

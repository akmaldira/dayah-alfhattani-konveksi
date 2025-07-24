"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DailyWork } from "@/lib/prisma/generated";
import {
  UpsertDailyWorkSchema,
  upsertDailyWorkSchema,
} from "@/schema/daily-work-schema";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

export async function upsertDailyWorkAction(
  values: UpsertDailyWorkSchema
): Promise<ActionResponse<DailyWork>> {
  try {
    const { data, error } = upsertDailyWorkSchema.safeParse(values);
    if (error) {
      return {
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      };
    }

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return {
        status: "error",
        error: {
          code: "UNAUTHORIZED",
          message: "Anda tidak memiliki akses ke halaman ini",
        },
      };
    }

    let dailyWork: DailyWork;
    if (data.action === "create") {
      const employee = await prisma.employee.findUnique({
        where: {
          id: data.employeeId,
        },
      });
      if (!employee) {
        return {
          status: "error",
          error: {
            code: "NOT_FOUND",
            message: "Karyawan tidak ditemukan",
          },
        };
      }

      dailyWork = await prisma.dailyWork.create({
        data: {
          name: data.name,
          description: data.description,
          employeeId: employee.id,
        },
      });
    } else {
      dailyWork = await prisma.dailyWork.update({
        where: {
          id: data.id,
        },
        data: {
          name: data.name,
          description: data.description,
        },
      });
    }

    revalidatePath("/app/employee/daily-work");

    return {
      status: "success",
      redirect: "/app/employee/daily-work",
      message: `Pekerjaan harian ${dailyWork.name} berhasil ${
        data.action === "create" ? "dibuat" : "diperbarui"
      }`,
      data: dailyWork,
    };
  } catch (error: any) {
    console.error(`[upsertDailyWorkAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan saat menyimpan data",
      },
    };
  }
}

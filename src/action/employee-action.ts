"use server";

import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import { Employee, EmployeeAttendance } from "@/lib/prisma/generated";
import {
  UpsertAttendanceSchema,
  upsertAttendanceSchema,
  upsertEmployeeSchema,
  UpsertEmployeeSchema,
} from "@/schema/employee-schema";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

export async function getEmployeesAction(): Promise<
  ActionResponse<Employee[]>
> {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
      },
    });
    return {
      status: "success",
      data: employees,
    };
  } catch (error: any) {
    console.error(`[getEmployeesAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function upsertEmployeeAction(
  values: UpsertEmployeeSchema
): Promise<ActionResponse<Employee>> {
  try {
    const { data, error } = upsertEmployeeSchema.safeParse(values);
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
        redirect: "/signin",
        error: {
          code: "UNAUTHORIZED",
          message: "Anda harus login untuk melakukan tindakan ini",
        },
      };
    }

    if (data.email?.trim()) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (data.action === "create" && !data.password?.trim()) {
        return {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Password harus diisi",
          },
        };
      } else if (data.action === "create" && existingUser) {
        return {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Email sudah terdaftar",
          },
        };
      } else if (data.action === "update" && !existingUser) {
        return {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Email tidak ditemukan",
          },
        };
      }
    }

    let employee: Employee;
    if (data.action === "create") {
      const userData = data.email?.trim()
        ? {
            create: {
              email: data.email,
              password: hashPassword(data.password!),
            },
          }
        : undefined;

      employee = await prisma.employee.create({
        data: {
          name: data.name,
          user: userData,
        },
      });
    } else {
      const userData = data.email?.trim()
        ? {
            update: {
              name: data.name,
              email: data.email,
              password: data.password ? hashPassword(data.password) : undefined,
            },
          }
        : undefined;

      employee = await prisma.employee.update({
        where: {
          id: data.id,
        },
        data: {
          name: data.name,
          user: userData,
        },
      });
    }

    revalidatePath("/app/employee");
    return {
      status: "success",
      redirect: "/app/employee",
      message: `Karyawan ${data.name} berhasil ${
        data.action === "create" ? "dibuat" : "diperbarui"
      }`,
      data: employee,
    };
  } catch (error: any) {
    console.error(`[upsertEmployeeAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function upsertAttendanceAction(
  values: UpsertAttendanceSchema
): Promise<ActionResponse<EmployeeAttendance>> {
  try {
    const { data, error } = upsertAttendanceSchema.safeParse(values);
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
        redirect: "/signin",
        error: {
          code: "UNAUTHORIZED",
          message: "Anda harus login untuk melakukan tindakan ini",
        },
      };
    }

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

    let attendance: EmployeeAttendance;
    if (data.action === "create") {
      const existingAttendance = await prisma.employeeAttendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: data.employeeId,
            date: data.date,
          },
        },
      });
      if (existingAttendance) {
        return {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Kehadiran di tanggal tersebut sudah ada",
          },
        };
      }

      attendance = await prisma.employeeAttendance.create({
        data: {
          employeeId: data.employeeId,
          status: data.status,
          date: data.date,
          createdById: user.id,
        },
      });
    } else {
      attendance = await prisma.employeeAttendance.update({
        where: {
          id: data.id,
        },
        data: {
          status: data.status,
          date: data.date,
        },
      });
    }

    revalidatePath("/app/employee/attendance");
    return {
      status: "success",
      redirect: "/app/employee/attendance",
      message: `Kehadiran karyawan ${employee.name} berhasil ${
        data.action === "create" ? "dibuat" : "diperbarui"
      }`,
      data: attendance,
    };
  } catch (error: any) {
    console.error(`[upsertAttendanceAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

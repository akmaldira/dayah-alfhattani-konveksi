"use server";

import { auth } from "@/lib/auth";
import { CASH_BALANCE_ID } from "@/lib/const";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma/generated";
import {
  deleteSalarySchema,
  DeleteSalarySchema,
  upsertSalarySchema,
  UpsertSalarySchema,
} from "@/schema/salary-schema";
import { ActionResponse } from "@/types/action";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { revalidatePath } from "next/cache";

export async function getEmployeeLoanAction(
  fromDate: Date | undefined,
  toDate: Date | undefined
): Promise<ActionResponse<EmployeeSalaryTransaction[]>> {
  try {
    const where: Prisma.TransactionWhereInput = {
      type: "EMPLOYEE_LOAN",
    };
    if (fromDate) {
      where.createdAt = {
        gte: fromDate,
      };
    }
    if (toDate) {
      where.createdAt = {
        ...(where.createdAt ?? ({} as any)),
        lte: toDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        items: {
          include: {
            employee: true,
          },
        },
      },
    });
    return {
      status: "success",
      data: transactions,
    };
  } catch (error: any) {
    console.error(`[getEmployeeLoanAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function getSalaryAction(
  transactionId: string
): Promise<ActionResponse<EmployeeSalaryTransaction>> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        items: {
          include: {
            employee: true,
          },
        },
      },
    });
    if (!transaction) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Transaksi tidak ditemukan",
        },
      };
    }
    return {
      status: "success",
      data: transaction,
    };
  } catch (error: any) {
    console.error(`[getSalaryAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function upsertSalaryAction(
  values: UpsertSalarySchema
): Promise<ActionResponse<EmployeeSalaryTransaction>> {
  try {
    const { data, error } = upsertSalarySchema.safeParse(values);
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

    const transactionResult: EmployeeSalaryTransaction =
      await prisma.$transaction(async (tx) => {
        let transaction: EmployeeSalaryTransaction;
        const cashBalance = await tx.cashBalance.upsert({
          where: {
            id: CASH_BALANCE_ID,
          },
          create: {},
          update: {},
        });

        if (data.action === "create") {
          const previousBalance = cashBalance.balance;
          const nextBalance = previousBalance - data.totalAmount;
          const auditLog = await tx.cashAuditLog.create({
            data: {
              type: "EMPLOYEE_LOAN",
              amount: data.totalAmount,
              previousBalance,
              nextBalance,
              note: `Ambilan ${employee.name}`,
              createdById: user.id,
            },
          });

          await tx.cashBalance.update({
            where: {
              id: CASH_BALANCE_ID,
            },
            data: {
              balance: nextBalance,
            },
          });

          transaction = await tx.transaction.create({
            data: {
              type: "EMPLOYEE_LOAN",
              totalAmount: data.totalAmount,
              note: data.note,
              createdById: user.id,
              source: employee.name,
              auditLogId: auditLog.id,
              items: {
                create: {
                  name: `Ambilan ${employee.name}`,
                  quantity: 1,
                  employeeId: data.employeeId,
                  totalPrice: data.totalAmount,
                },
              },
            },
            include: {
              items: {
                include: {
                  employee: true,
                },
              },
            },
          });
        } else {
          const oldTransaction = await tx.transaction.findUnique({
            where: {
              id: data.id,
            },
            include: {
              items: {
                include: {
                  employee: true,
                },
              },
            },
          });
          if (!oldTransaction || !oldTransaction.auditLogId) {
            throw new Error("Transaksi tidak ditemukan");
          }

          const oldAuditLog = await tx.cashAuditLog.findUnique({
            where: {
              id: oldTransaction.auditLogId,
            },
          });
          if (!oldAuditLog) {
            throw new Error("Log kas tidak ditemukan");
          }

          await tx.cashAuditLog.delete({
            where: {
              id: oldAuditLog.id,
            },
          });

          const newCashBalance = cashBalance.balance + oldAuditLog.amount;
          await tx.cashBalance.update({
            where: {
              id: CASH_BALANCE_ID,
            },
            data: {
              balance: newCashBalance - data.totalAmount,
            },
          });

          const nextBalance = newCashBalance - data.totalAmount;
          const auditLog = await tx.cashAuditLog.create({
            data: {
              type: "EMPLOYEE_LOAN",
              amount: data.totalAmount,
              previousBalance: newCashBalance,
              nextBalance,
              note: `Update Ambilan ${employee.name}`,
              createdById: user.id,
            },
          });

          // DELETE OLD ITEM
          await tx.transactionItem.delete({
            where: {
              id: oldTransaction.items[0].id,
            },
          });

          transaction = await tx.transaction.update({
            where: {
              id: oldTransaction.id,
            },
            data: {
              type: "EMPLOYEE_LOAN",
              totalAmount: data.totalAmount,
              note: data.note,
              source: employee.name,
              createdById: user.id,
              auditLogId: auditLog.id,
              items: {
                create: {
                  name: `Ambilan ${employee.name}`,
                  quantity: 1,
                  employeeId: data.employeeId,
                  totalPrice: data.totalAmount,
                },
              },
            },
            include: {
              items: {
                include: {
                  employee: true,
                },
              },
            },
          });
        }

        return transaction;
      });

    revalidatePath("/app/finance/employee-loan");
    revalidatePath("/app/finance/transaction");
    return {
      status: "success",
      data: transactionResult,
      message: "Berhasil menyimpan data",
    };
  } catch (error: any) {
    console.error(`[upsertSalaryAction] ${error} ${JSON.stringify(values)}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function deleteSalaryAction(
  values: DeleteSalarySchema
): Promise<ActionResponse<EmployeeSalaryTransaction>> {
  try {
    const { data, error } = deleteSalarySchema.safeParse(values);
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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: data.id,
      },
      include: {
        items: {
          include: {
            employee: true,
          },
        },
      },
    });
    if (!transaction || !transaction.auditLogId) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Transaksi tidak ditemukan",
        },
      };
    }

    if (transaction.type !== "EMPLOYEE_LOAN") {
      return {
        status: "error",
        error: {
          code: "BAD_REQUEST",
          message: "Transaksi bukan ambilan karyawan",
        },
      };
    }

    await prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: {
          id: CASH_BALANCE_ID,
        },
        create: {},
        update: {},
      });

      const oldAuditLog = await tx.cashAuditLog.findUnique({
        where: {
          id: transaction.auditLogId!,
        },
      });
      if (!oldAuditLog) {
        throw new Error("Log kas tidak ditemukan");
      }

      const newCashBalance = cashBalance.balance + oldAuditLog.amount;
      await tx.cashBalance.update({
        where: {
          id: CASH_BALANCE_ID,
        },
        data: {
          balance: newCashBalance,
        },
      });

      await tx.cashAuditLog.delete({
        where: {
          id: oldAuditLog.id,
        },
      });

      await tx.transactionItem.deleteMany({
        where: {
          transactionId: transaction.id,
        },
      });

      await tx.transaction.delete({
        where: {
          id: transaction.id,
        },
      });
    });

    revalidatePath("/app/finance/employee-loan");
    revalidatePath("/app/finance/transaction");
    return {
      status: "success",
      data: transaction,
      message: "Berhasil menghapus data",
    };
  } catch (error: any) {
    console.error(`[deleteSalaryAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

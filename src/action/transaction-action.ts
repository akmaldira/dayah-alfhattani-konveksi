"use server";

import { auth } from "@/lib/auth";
import { CASH_BALANCE_ID } from "@/lib/const";
import { prisma } from "@/lib/prisma";
import {
  CashAuditLog,
  Prisma,
  StockMutation,
  Transaction,
  TransactionItem,
} from "@/lib/prisma/generated";
import {
  deleteTransactionSchema,
  DeleteTransactionSchema,
  upsertCashSchema,
  UpsertCashSchema,
  upsertTransactionSchema,
  UpsertTransactionSchema,
} from "@/schema/transaction-schema";
import { ActionResponse } from "@/types/action";
import { TransactionWithAllRelations } from "@/types/prisma";
import { revalidatePath } from "next/cache";

export async function getTransactionsAction(
  fromDate: Date | undefined,
  toDate: Date | undefined,
  type: "EMPLOYEE_LOAN" | "EXPENSE" | "INCOME"
): Promise<ActionResponse<TransactionWithAllRelations[]>> {
  try {
    const where: Prisma.TransactionWhereInput = {
      type,
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
            mutation: {
              include: {
                unitConversion: true,
                variant: true,
              },
            },
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

export async function createExpenseAction(
  values: UpsertTransactionSchema
): Promise<ActionResponse<Transaction>> {
  try {
    const { data, error } = upsertTransactionSchema.safeParse(values);

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

    const transaction = await prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: { id: CASH_BALANCE_ID },
        update: {},
        create: {},
      });
      const totalAmount = data.items.reduce(
        (acc, item) => acc + item.totalPrice,
        0
      );

      const initialTransaction = await tx.transaction.create({
        data: {
          type: "EXPENSE",
          source: data.source,
          note: data.note,
          createdById: user.id,
          totalAmount,
        },
      });

      const transactionItems: TransactionItem[] = [];
      for (const transactionItem of data.items) {
        let txItem: TransactionItem;
        if (transactionItem.type === "item") {
          txItem = await tx.transactionItem.create({
            data: {
              transactionId: initialTransaction.id,
              name: transactionItem.name,
              quantity: transactionItem.quantity,
              totalPrice: transactionItem.totalPrice,
            },
          });
        } else {
          const item = await tx.item.findUnique({
            where: {
              id: transactionItem.itemId,
            },
          });
          if (!item) {
            throw new Error("Item tidak ditemukan");
          }

          const variant = await tx.variant.findUnique({
            where: {
              id: transactionItem.variantId,
              itemId: transactionItem.itemId,
            },
          });
          if (!variant) {
            throw new Error("Varian tidak ditemukan");
          }

          const unit = await tx.unitConversion.findUnique({
            where: {
              id: transactionItem.unitId,
              itemId: transactionItem.itemId,
            },
          });
          if (!unit) {
            throw new Error("Satuan tidak ditemukan");
          }

          let stockMutation: StockMutation | null = null;
          if (transactionItem.appendToStock) {
            stockMutation = await tx.stockMutation.create({
              data: {
                type: "IN",
                variantId: transactionItem.variantId,
                quantity: transactionItem.quantity,
                unitConversionId: transactionItem.unitId,
                source: `Belanjaan`,
                note: `Penambahan stok otomatis ketika pengeluaran dibuat`,
                createdById: user.id,
              },
            });

            const stockToDefaultUnit =
              transactionItem.quantity * unit.multiplier;
            await tx.variant.update({
              where: {
                id: transactionItem.variantId,
              },
              data: {
                currentStock: { increment: stockToDefaultUnit },
              },
            });
          }

          txItem = await tx.transactionItem.create({
            data: {
              transactionId: initialTransaction.id,
              mutationId: stockMutation?.id,
              name: `${item.name} - ${variant.name}`,
              quantity: transactionItem.quantity,
              unit: unit.fromUnit,
              supplier: transactionItem.supplier,
              totalPrice: transactionItem.totalPrice,
            },
          });
        }

        transactionItems.push(txItem);
      }

      const nextBalance = cashBalance.balance - totalAmount;
      await tx.cashAuditLog.create({
        data: {
          type: "EXPENSE",
          amount: totalAmount,
          previousBalance: cashBalance.balance,
          nextBalance,
          createdById: user.id,
          note: `Pengeluaran ${initialTransaction.id}`,
          transaction: {
            connect: {
              id: initialTransaction.id,
            },
          },
        },
      });

      await tx.cashBalance.update({
        where: { id: cashBalance.id },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      });

      return initialTransaction;
    });

    revalidatePath("/app/finance/expense");
    return {
      status: "success",
      data: transaction,
      message: "Pengeluaran berhasil dibuat",
      redirect: "/app/finance/expense",
    };
  } catch (error: any) {
    console.error(`[createExpenseAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function deleteExpenseAction(
  values: DeleteTransactionSchema
): Promise<ActionResponse<Transaction>> {
  try {
    const { data, error } = deleteTransactionSchema.safeParse(values);
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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: data.id,
      },
      include: {
        items: {
          include: {
            mutation: {
              include: {
                unitConversion: true,
                variant: {
                  include: {
                    item: true,
                  },
                },
              },
            },
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

    if (transaction.type !== "EXPENSE") {
      return {
        status: "error",
        error: {
          code: "BAD_REQUEST",
          message: "Transaksi bukan pengeluaran",
        },
      };
    }

    await prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: { id: CASH_BALANCE_ID },
        update: {},
        create: {},
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
        where: { id: cashBalance.id },
        data: {
          balance: newCashBalance,
        },
      });

      await tx.cashAuditLog.delete({
        where: {
          id: oldAuditLog.id,
        },
      });

      for (const item of transaction.items) {
        if (item.mutation) {
          await tx.stockMutation.delete({
            where: {
              id: item.mutation.id,
            },
          });

          const stockToDefaultUnit =
            item.mutation.quantity * item.mutation.unitConversion.multiplier;
          await tx.variant.update({
            where: {
              id: item.mutation.variantId,
            },
            data: {
              currentStock: {
                decrement: stockToDefaultUnit,
              },
            },
          });
        }
      }

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

    revalidatePath("/app/finance/expense");
    revalidatePath("/app/finance/transaction");
    return {
      status: "success",
      data: transaction,
      message: "Pengeluaran berhasil dihapus",
    };
  } catch (error: any) {
    console.error(`[deleteExpenseAction] ${error}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function upsertCashAction(
  values: UpsertCashSchema
): Promise<ActionResponse<CashAuditLog>> {
  try {
    const { data, error } = upsertCashSchema.safeParse(values);

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

    const cashAuditLog = await prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: { id: CASH_BALANCE_ID },
        update: {},
        create: {},
      });

      const nextBalance =
        data.action === "increase"
          ? cashBalance.balance + data.amount
          : cashBalance.balance - data.amount;

      const initialCashAuditLog = await tx.cashAuditLog.create({
        data: {
          type: "ADJUSTMENT",
          amount: data.amount,
          previousBalance: cashBalance.balance,
          nextBalance,
          createdById: user.id,
          note: data.note,
        },
      });

      await tx.cashBalance.update({
        where: { id: cashBalance.id },
        data: {
          balance: nextBalance,
        },
      });

      return initialCashAuditLog;
    });

    revalidatePath("/app/finance");
    return {
      status: "success",
      data: cashAuditLog,
      message: "Perubahan saldo berhasil dibuat",
      redirect: "/app/finance",
    };
  } catch (error: any) {
    console.error(`[upsertCashAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function createIncomeAction(
  values: UpsertTransactionSchema
): Promise<ActionResponse<Transaction>> {
  try {
    const { data, error } = upsertTransactionSchema.safeParse(values);

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

    const transaction = await prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: { id: CASH_BALANCE_ID },
        update: {},
        create: {},
      });
      const totalAmount = data.items.reduce(
        (acc, item) => acc + item.totalPrice,
        0
      );

      const initialTransaction = await tx.transaction.create({
        data: {
          type: "INCOME",
          source: data.source,
          note: data.note,
          createdById: user.id,
          totalAmount,
        },
      });

      for (const transactionItem of data.items) {
        await tx.transactionItem.create({
          data: {
            transactionId: initialTransaction.id,
            name: transactionItem.name,
            quantity: transactionItem.quantity,
            totalPrice: transactionItem.totalPrice,
          },
        });
      }

      const nextBalance = cashBalance.balance + totalAmount;
      await tx.cashAuditLog.create({
        data: {
          type: "INCOME",
          amount: totalAmount,
          previousBalance: cashBalance.balance,
          nextBalance,
          createdById: user.id,
          note: `Pemasukan ${initialTransaction.id}`,
          transaction: {
            connect: {
              id: initialTransaction.id,
            },
          },
        },
      });

      await tx.cashBalance.update({
        where: { id: cashBalance.id },
        data: {
          balance: nextBalance,
        },
      });

      return initialTransaction;
    });

    return {
      status: "success",
      data: transaction,
      message: "Pemasukan berhasil dibuat",
      redirect: "/app/finance/income",
    };
  } catch (error: any) {
    console.error(`[createIncomeAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function deleteIncomeAction(
  values: DeleteTransactionSchema
): Promise<ActionResponse<Transaction>> {
  try {
    const { data, error } = deleteTransactionSchema.safeParse(values);
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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: data.id,
      },
      include: {
        items: true,
      },
    });

    console.log(transaction);

    if (!transaction) {
      return {
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Transaksi tidak ditemukan",
        },
      };
    }

    if (transaction.type !== "INCOME") {
      return {
        status: "error",
        error: {
          code: "BAD_REQUEST",
          message: "Transaksi bukan pemasukan",
        },
      };
    }

    await prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: { id: CASH_BALANCE_ID },
        update: {},
        create: {},
      });

      const oldAuditLog = await tx.cashAuditLog.findUnique({
        where: {
          id: transaction.auditLogId!,
        },
      });
      if (!oldAuditLog) {
        throw new Error("Log kas tidak ditemukan");
      }

      const newCashBalance = cashBalance.balance - oldAuditLog.amount;
      await tx.cashBalance.update({
        where: { id: cashBalance.id },
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

    revalidatePath("/app/finance/income");
    revalidatePath("/app/finance/transaction");
    return {
      status: "success",
      data: transaction,
      message: "Pemasukan berhasil dihapus",
    };
  } catch (error: any) {
    console.error(`[deleteIncomeAction] ${error.message}`);
    return {
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

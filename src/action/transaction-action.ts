"use server";

import { auth } from "@/lib/auth";
import { CASH_BALANCE_ID } from "@/lib/const";
import { prisma } from "@/lib/prisma";
import {
  StockMutation,
  Transaction,
  TransactionItem,
} from "@/lib/prisma/generated";
import {
  upsertTransactionSchema,
  UpsertTransactionSchema,
} from "@/schema/transaction-schema";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

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
        error: {
          code: "UNAUTHORIZED",
          message: "Anda harus login untuk melakukan tindakan ini",
        },
      };
    }

    const cashBalance = await prisma.cashBalance.upsert({
      where: { id: CASH_BALANCE_ID },
      update: {},
      create: {},
    });

    const transaction = await prisma.$transaction(async (tx) => {
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
                unit: unit.fromUnit,
                source: "Pengeluaran",
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

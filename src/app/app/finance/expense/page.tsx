import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import { getTransactionSummary } from "@/lib/prisma/transaction";
import { ExpenseClient } from "./client";

export default async function ExpensePage() {
  const expenses = await prisma.transaction.findMany({
    where: {
      type: "EXPENSE",
    },
    include: {
      items: {
        include: {
          mutation: {
            include: {
              variant: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const expenseSummary = await getTransactionSummary("EXPENSE");

  return (
    <div className="pb-20">
      <PageLabel label="Pengeluaran" />
      <ExpenseClient
        expenses={expenses}
        countExpenses={expenseSummary.countExpenses}
        amountExpenses={expenseSummary.amountExpenses}
        amountExpensesWithStockMutation={
          expenseSummary.amountExpensesWithStockMutation
        }
        amountExpensesWithoutStockMutation={
          expenseSummary.amountExpensesWithoutStockMutation
        }
        trendDaily={expenseSummary.trendDaily}
      />
    </div>
  );
}

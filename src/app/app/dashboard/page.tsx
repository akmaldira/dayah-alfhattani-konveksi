import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const monthlyExpense = await prisma.$queryRaw<
    {
      date: string;
      total_amount: number;
    }[]
  >`
    SELECT
      date_trunc('month', created_at) as date,
      SUM(total_amount) as total_amount
    FROM "transaction"
    WHERE type = 'EXPENSE'
    GROUP BY date
    ORDER BY date DESC
  `;

  const monthlyIncome = await prisma.$queryRaw<
    {
      date: string;
      total_amount: number;
    }[]
  >`
    SELECT
      date_trunc('month', created_at) as date,
      SUM(total_amount) as total_amount
    FROM "transaction"
    WHERE type = 'INCOME'
    GROUP BY date
    ORDER BY date DESC
  `;

  const monthlyEmployeeLoan = await prisma.$queryRaw<
    {
      date: string;
      total_amount: number;
    }[]
  >`
    SELECT
      date_trunc('month', created_at) as date,
      SUM(total_amount) as total_amount
    FROM "transaction"
    WHERE type = 'EMPLOYEE_LOAN'
    GROUP BY date
    ORDER BY date DESC
  `;

  return (
    <div className="pb-20">
      <PageLabel label="Dashboard" />
      <DashboardClient
        monthlyExpense={monthlyExpense}
        monthlyIncome={monthlyIncome}
        monthlyEmployeeLoan={monthlyEmployeeLoan}
      />
    </div>
  );
}

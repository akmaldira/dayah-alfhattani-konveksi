"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";

// Lazy load the entire chart as a single component to avoid typing issues
const DashboardChart = dynamic(
  () => import("./dashboard-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    ),
  }
);

export default function DashboardClient({
  monthlyExpense,
  monthlyIncome,
  monthlyEmployeeLoan,
}: {
  monthlyExpense: {
    date: string;
    total_amount: number;
  }[];
  monthlyIncome: {
    date: string;
    total_amount: number;
  }[];
  monthlyEmployeeLoan: {
    date: string;
    total_amount: number;
  }[];
}) {
  // Process data for chart (memoized for performance)
  const chartData = React.useMemo(() => {
    const allMonths = new Set([
      ...monthlyIncome.map((item) => item.date),
      ...monthlyExpense.map((item) => item.date),
      ...monthlyEmployeeLoan.map((item) => item.date),
    ]);

    return Array.from(allMonths)
      .sort()
      .map((month) => {
        const income =
          monthlyIncome.find((item) => item.date === month)?.total_amount || 0;
        const expense =
          monthlyExpense.find((item) => item.date === month)?.total_amount || 0;
        const employee_loan =
          monthlyEmployeeLoan.find((item) => item.date === month)
            ?.total_amount || 0;

        return {
          month: new Date(month).toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
          }),
          income,
          expense,
          employee_loan,
        };
      });
  }, [monthlyIncome, monthlyExpense, monthlyEmployeeLoan]);

  // Calculate totals (memoized for performance)
  const totals = React.useMemo(() => {
    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = chartData.reduce(
      (sum, item) => sum + item.expense,
      0
    );
    const totalEmployeeLoan = chartData.reduce(
      (sum, item) => sum + item.employee_loan,
      0
    );

    return { totalIncome, totalExpense, totalEmployeeLoan };
  }, [chartData]);

  return (
    <div className="grid gap-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari semua transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari semua transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gaji</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalEmployeeLoan)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari semua transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ringkasan Bulanan
          </CardTitle>
          <CardDescription>
            Perbandingan pemasukan, pengeluaran, dan gaji per bulan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}

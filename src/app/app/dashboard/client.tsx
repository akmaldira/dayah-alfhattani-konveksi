"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "#22c55e", // Green - positive income
  },
  expense: {
    label: "Pengeluaran",
    color: "#ef4444", // Red - expenses
  },
  employee_loan: {
    label: "Ambilan Karyawan",
    color: "#f59e0b", // Amber - employee loans
  },
  net: {
    label: "Net",
    color: "#3b82f6", // Blue - net result
  },
} satisfies ChartConfig;

export default function DashboardClient({
  monthlyExpense,
  monthlyIncome,
  monthlyEmployeeLoan,
}: {
  monthlyExpense: { date: string; total_amount: number }[];
  monthlyIncome: { date: string; total_amount: number }[];
  monthlyEmployeeLoan: { date: string; total_amount: number }[];
}) {
  // Create a comprehensive data structure
  const allMonths = new Set([
    ...monthlyExpense.map((item) => format(new Date(item.date), "yyyy-MM")),
    ...monthlyIncome.map((item) => format(new Date(item.date), "yyyy-MM")),
    ...monthlyEmployeeLoan.map((item) =>
      format(new Date(item.date), "yyyy-MM")
    ),
  ]);

  const chartData = Array.from(allMonths)
    .map((monthKey) => {
      const expenseItem = monthlyExpense.find(
        (item) => format(new Date(item.date), "yyyy-MM") === monthKey
      );
      const incomeItem = monthlyIncome.find(
        (item) => format(new Date(item.date), "yyyy-MM") === monthKey
      );
      const loanItem = monthlyEmployeeLoan.find(
        (item) => format(new Date(item.date), "yyyy-MM") === monthKey
      );

      const expense = expenseItem?.total_amount || 0;
      const income = incomeItem?.total_amount || 0;
      const employeeLoan = loanItem?.total_amount || 0;
      const net = income - expense - employeeLoan;

      return {
        month: format(new Date(monthKey + "-01"), "MMM yyyy", { locale: id }),
        income,
        expense: -expense, // Negative for visual representation
        employee_loan: -employeeLoan, // Negative for visual representation
        net,
        monthKey,
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Calculate summary statistics
  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = chartData.reduce(
    (sum, item) => sum + Math.abs(item.expense),
    0
  );
  const totalEmployeeLoan = chartData.reduce(
    (sum, item) => sum + Math.abs(item.employee_loan),
    0
  );
  const netTotal = totalIncome - totalExpense - totalEmployeeLoan;
  const isPositiveTrend = netTotal > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Total Pemasukan
            </CardTitle>
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalIncome.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pendapatan periode ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Total Pengeluaran
            </CardTitle>
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {totalExpense.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Total biaya periode ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Total Ambilan Karyawan
            </CardTitle>
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              Rp {totalEmployeeLoan.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Total advance karyawan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Keuangan Bulanan</CardTitle>
          <CardDescription>
            Ringkasan pemasukan, pengeluaran, dan ambilan karyawan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) =>
                    `${Math.abs(value).toLocaleString()}`
                  }
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        <div key={name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                chartConfig[name as keyof typeof chartConfig]
                                  ?.color,
                            }}
                          />
                          <span>
                            {chartConfig[name as keyof typeof chartConfig]
                              ?.label || name}
                            : Rp{" "}
                            {Math.abs(Number(value)).toLocaleString("id-ID")}
                          </span>
                        </div>,
                        "",
                      ]}
                      className="shadow-lg border rounded-lg"
                    />
                  }
                />
                <Bar
                  dataKey="income"
                  fill={chartConfig.income.color}
                  name="income"
                  stroke={chartConfig.income.color}
                  strokeWidth={0}
                />
                <Bar
                  dataKey="expense"
                  fill={chartConfig.expense.color}
                  name="expense"
                  stroke={chartConfig.expense.color}
                  strokeWidth={0}
                />
                <Bar
                  dataKey="employee_loan"
                  fill={chartConfig.employee_loan.color}
                  name="employee_loan"
                  stroke={chartConfig.employee_loan.color}
                  strokeWidth={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-3 text-sm border-t pt-4">
          <div className="flex items-center gap-2 font-medium">
            <span>
              Net Total: Rp {Math.abs(netTotal).toLocaleString("id-ID")}
            </span>
            {isPositiveTrend ? (
              <>
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold">
                  Surplus
                </span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </>
            ) : (
              <>
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-semibold">
                  Defisit
                </span>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 w-full text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="">Pemasukan:</span>
              <span className="font-medium">
                Rp {totalIncome.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="">Pengeluaran:</span>
              <span className="font-medium">
                Rp {totalExpense.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="">Ambilan:</span>
              <span className="font-medium">
                Rp {totalEmployeeLoan.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

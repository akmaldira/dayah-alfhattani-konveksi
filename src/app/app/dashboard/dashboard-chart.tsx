"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Pengeluaran",
    color: "var(--chart-2)",
  },
  employee_loan: {
    label: "Gaji",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface DashboardChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
    employee_loan: number;
  }[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value / 1000000}M`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                chartConfig[name as keyof typeof chartConfig]
                  ?.label || name,
              ]}
              labelFormatter={(label) => `Bulan: ${label}`}
            />
          }
        />
        <Bar
          dataKey="income"
          fill={chartConfig.income.color}
          radius={4}
          stroke={chartConfig.income.color}
          strokeWidth={2}
        />
        <Bar
          dataKey="expense"
          fill={chartConfig.expense.color}
          radius={4}
          stroke={chartConfig.expense.color}
          strokeWidth={2}
        />
        <Bar
          dataKey="employee_loan"
          fill={chartConfig.employee_loan.color}
          radius={4}
          stroke={chartConfig.employee_loan.color}
          strokeWidth={2}
        />
      </BarChart>
    </ChartContainer>
  );
}
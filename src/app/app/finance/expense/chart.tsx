"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const _dummyData = [
  {
    date: new Date("2025-06-12"),
    with_stock: 120000,
    without_stock: 30000,
    total: 150000,
  },
  {
    date: new Date("2025-06-13"),
    with_stock: 90000,
    without_stock: 15000,
    total: 105000,
  },
  {
    date: new Date("2025-06-14"),
    with_stock: 110000,
    without_stock: 20000,
    total: 130000,
  },
  {
    date: new Date("2025-06-15"),
    with_stock: 130000,
    without_stock: 50000,
    total: 180000,
  },
  {
    date: new Date("2025-06-16"),
    with_stock: 140000,
    without_stock: 35000,
    total: 175000,
  },
  {
    date: new Date("2025-06-17"),
    with_stock: 60000,
    without_stock: 20000,
    total: 80000,
  },
  {
    date: new Date("2025-06-18"),
    with_stock: 95000,
    without_stock: 40000,
    total: 135000,
  },
  {
    date: new Date("2025-06-19"),
    with_stock: 105000,
    without_stock: 30000,
    total: 135000,
  },
  {
    date: new Date("2025-06-20"),
    with_stock: 125000,
    without_stock: 25000,
    total: 150000,
  },
  {
    date: new Date("2025-06-21"),
    with_stock: 115000,
    without_stock: 45000,
    total: 160000,
  },
  {
    date: new Date("2025-06-22"),
    with_stock: 100000,
    without_stock: 50000,
    total: 150000,
  },
  {
    date: new Date("2025-06-23"),
    with_stock: 70000,
    without_stock: 20000,
    total: 90000,
  },
  {
    date: new Date("2025-06-24"),
    with_stock: 90000,
    without_stock: 30000,
    total: 120000,
  },
  {
    date: new Date("2025-06-25"),
    with_stock: 80000,
    without_stock: 40000,
    total: 120000,
  },
  {
    date: new Date("2025-06-26"),
    with_stock: 95000,
    without_stock: 15000,
    total: 110000,
  },
  {
    date: new Date("2025-06-27"),
    with_stock: 85000,
    without_stock: 25000,
    total: 110000,
  },
  {
    date: new Date("2025-06-28"),
    with_stock: 130000,
    without_stock: 20000,
    total: 150000,
  },
  {
    date: new Date("2025-06-29"),
    with_stock: 120000,
    without_stock: 10000,
    total: 130000,
  },
  {
    date: new Date("2025-06-30"),
    with_stock: 110000,
    without_stock: 30000,
    total: 140000,
  },
  {
    date: new Date("2025-07-01"),
    with_stock: 100000,
    without_stock: 25000,
    total: 125000,
  },
  {
    date: new Date("2025-07-02"),
    with_stock: 90000,
    without_stock: 20000,
    total: 110000,
  },
  {
    date: new Date("2025-07-03"),
    with_stock: 95000,
    without_stock: 50000,
    total: 145000,
  },
  {
    date: new Date("2025-07-04"),
    with_stock: 105000,
    without_stock: 40000,
    total: 145000,
  },
  {
    date: new Date("2025-07-05"),
    with_stock: 85000,
    without_stock: 30000,
    total: 115000,
  },
  {
    date: new Date("2025-07-06"),
    with_stock: 115000,
    without_stock: 35000,
    total: 150000,
  },
  {
    date: new Date("2025-07-07"),
    with_stock: 120000,
    without_stock: 30000,
    total: 150000,
  },
  {
    date: new Date("2025-07-08"),
    with_stock: 95000,
    without_stock: 25000,
    total: 120000,
  },
  {
    date: new Date("2025-07-09"),
    with_stock: 80000,
    without_stock: 40000,
    total: 120000,
  },
  {
    date: new Date("2025-07-10"),
    with_stock: 130000,
    without_stock: 20000,
    total: 150000,
  },
  {
    date: new Date("2025-07-11"),
    with_stock: 140000,
    without_stock: 30000,
    total: 170000,
  },
];

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-3)",
  },
  with_stock: {
    label: "Barang",
    color: "var(--chart-1)",
  },
  without_stock: {
    label: "Non-barang",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DailyExpenseChart({
  chartData,
}: {
  chartData: {
    date: Date;
    with_stock: number;
    without_stock: number;
    total: number;
  }[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[300px] mt-[50px] w-full"
    >
      <AreaChart
        data={chartData.map((item) => ({
          ...item,
          date: item.date.toISOString().split("T")[0],
        }))}
      >
        <defs>
          <linearGradient id="fillWithStock" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-with_stock)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-with_stock)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillWithoutStock" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-without_stock)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-without_stock)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillTotalExpense" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-total)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-total)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              formatter={(value, name) => (
                <>
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                    style={
                      {
                        "--color-bg": `var(--color-${name})`,
                      } as React.CSSProperties
                    }
                  />
                  {chartConfig[name as keyof typeof chartConfig]?.label || name}
                  <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                    {formatCurrency(value as number)}
                  </div>
                </>
              )}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="without_stock"
          type="natural"
          fill="url(#fillWithoutStock)"
          stroke="var(--color-without_stock)"
          stackId="a"
        />
        <Area
          dataKey="with_stock"
          type="natural"
          fill="url(#fillWithStock)"
          stroke="var(--color-with_stock)"
          stackId="a"
        />
        <Area
          dataKey="total"
          type="natural"
          fill="url(#fillTotalExpense)"
          stroke="var(--color-total)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

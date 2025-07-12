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

const dummyData = [
  {
    day: "2025-06-12T00:00:00.000Z",
    with_stock: 120000,
    without_stock: 30000,
    total: 150000,
  },
  {
    day: "2025-06-13T00:00:00.000Z",
    with_stock: 90000,
    without_stock: 15000,
    total: 105000,
  },
  {
    day: "2025-06-14T00:00:00.000Z",
    with_stock: 110000,
    without_stock: 20000,
    total: 130000,
  },
  {
    day: "2025-06-15T00:00:00.000Z",
    with_stock: 130000,
    without_stock: 50000,
    total: 180000,
  },
  {
    day: "2025-06-16T00:00:00.000Z",
    with_stock: 140000,
    without_stock: 35000,
    total: 175000,
  },
  {
    day: "2025-06-17T00:00:00.000Z",
    with_stock: 60000,
    without_stock: 20000,
    total: 80000,
  },
  {
    day: "2025-06-18T00:00:00.000Z",
    with_stock: 95000,
    without_stock: 40000,
    total: 135000,
  },
  {
    day: "2025-06-19T00:00:00.000Z",
    with_stock: 105000,
    without_stock: 30000,
    total: 135000,
  },
  {
    day: "2025-06-20T00:00:00.000Z",
    with_stock: 125000,
    without_stock: 25000,
    total: 150000,
  },
  {
    day: "2025-06-21T00:00:00.000Z",
    with_stock: 115000,
    without_stock: 45000,
    total: 160000,
  },
  {
    day: "2025-06-22T00:00:00.000Z",
    with_stock: 100000,
    without_stock: 50000,
    total: 150000,
  },
  {
    day: "2025-06-23T00:00:00.000Z",
    with_stock: 70000,
    without_stock: 20000,
    total: 90000,
  },
  {
    day: "2025-06-24T00:00:00.000Z",
    with_stock: 90000,
    without_stock: 30000,
    total: 120000,
  },
  {
    day: "2025-06-25T00:00:00.000Z",
    with_stock: 80000,
    without_stock: 40000,
    total: 120000,
  },
  {
    day: "2025-06-26T00:00:00.000Z",
    with_stock: 95000,
    without_stock: 15000,
    total: 110000,
  },
  {
    day: "2025-06-27T00:00:00.000Z",
    with_stock: 85000,
    without_stock: 25000,
    total: 110000,
  },
  {
    day: "2025-06-28T00:00:00.000Z",
    with_stock: 130000,
    without_stock: 20000,
    total: 150000,
  },
  {
    day: "2025-06-29T00:00:00.000Z",
    with_stock: 120000,
    without_stock: 10000,
    total: 130000,
  },
  {
    day: "2025-06-30T00:00:00.000Z",
    with_stock: 110000,
    without_stock: 30000,
    total: 140000,
  },
  {
    day: "2025-07-01T00:00:00.000Z",
    with_stock: 100000,
    without_stock: 25000,
    total: 125000,
  },
  {
    day: "2025-07-02T00:00:00.000Z",
    with_stock: 90000,
    without_stock: 20000,
    total: 110000,
  },
  {
    day: "2025-07-03T00:00:00.000Z",
    with_stock: 95000,
    without_stock: 50000,
    total: 145000,
  },
  {
    day: "2025-07-04T00:00:00.000Z",
    with_stock: 105000,
    without_stock: 40000,
    total: 145000,
  },
  {
    day: "2025-07-05T00:00:00.000Z",
    with_stock: 85000,
    without_stock: 30000,
    total: 115000,
  },
  {
    day: "2025-07-06T00:00:00.000Z",
    with_stock: 115000,
    without_stock: 35000,
    total: 150000,
  },
  {
    day: "2025-07-07T00:00:00.000Z",
    with_stock: 120000,
    without_stock: 30000,
    total: 150000,
  },
  {
    day: "2025-07-08T00:00:00.000Z",
    with_stock: 95000,
    without_stock: 25000,
    total: 120000,
  },
  {
    day: "2025-07-09T00:00:00.000Z",
    with_stock: 80000,
    without_stock: 40000,
    total: 120000,
  },
  {
    day: "2025-07-10T00:00:00.000Z",
    with_stock: 130000,
    without_stock: 20000,
    total: 150000,
  },
  {
    day: "2025-07-11T00:00:00.000Z",
    with_stock: 140000,
    without_stock: 30000,
    total: 170000,
  },
];

export function DailyExpenseChart({
  chartData,
}: {
  chartData: {
    day: string;
    with_stock: number;
    without_stock: number;
    total: number;
  }[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full"
    >
      <AreaChart data={dummyData}>
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
          dataKey="day"
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

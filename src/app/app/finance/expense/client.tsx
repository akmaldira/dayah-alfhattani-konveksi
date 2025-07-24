"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  cn,
  differenceAmountPercentageToString,
  formatCurrency,
} from "@/lib/utils";
import { TransactionWithAllRelations } from "@/types/prisma";
import { PackageOpen, Rss, ShoppingBag, TrendingUp } from "lucide-react";
import { DailyExpenseChart } from "./chart";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export function ExpenseClient({
  expenses,
  countExpenses,
  amountExpenses,
  amountExpensesWithStockMutation,
  amountExpensesWithoutStockMutation,
  trendDaily,
}: {
  expenses: TransactionWithAllRelations[];
  countExpenses: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  amountExpenses: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  amountExpensesWithStockMutation: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  amountExpensesWithoutStockMutation: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  trendDaily: {
    date: Date;
    with_stock: number;
    without_stock: number;
    total: number;
  }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jumlah Pengeluaran
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{countExpenses.total}</div>
            <ul className="list-disc list-outside">
              <li className="text-xs text-muted-foreground">
                Bulan Ini: {countExpenses.thisMonth}
              </li>
              <li className="text-xs text-muted-foreground">
                Bulan Lalu: {countExpenses.lastMonth}
              </li>
              <li
                className={cn(
                  "text-xs text-muted-foreground",
                  countExpenses.thisMonth >= countExpenses.lastMonth
                    ? "text-red-500"
                    : "text-green-500"
                )}
              >
                {countExpenses.thisMonth >= countExpenses.lastMonth
                  ? "Naik"
                  : "Turun"}{" "}
                {differenceAmountPercentageToString(
                  countExpenses.thisMonth,
                  countExpenses.lastMonth
                )}{" "}
                dari bulan lalu
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pembelian Bukan Barang
            </CardTitle>
            <Rss className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(amountExpensesWithoutStockMutation.total)}
            </div>
            <ul className="list-disc list-outside">
              <li className="text-xs text-muted-foreground">
                Bulan Ini:{" "}
                {formatCurrency(amountExpensesWithoutStockMutation.thisMonth)}
              </li>
              <li className="text-xs text-muted-foreground">
                Bulan Lalu:{" "}
                {formatCurrency(amountExpensesWithoutStockMutation.lastMonth)}
              </li>
              <li
                className={cn(
                  "text-xs text-muted-foreground",
                  amountExpensesWithoutStockMutation.thisMonth >=
                    amountExpensesWithoutStockMutation.lastMonth
                    ? "text-red-500"
                    : "text-green-500"
                )}
              >
                {amountExpensesWithoutStockMutation.thisMonth >=
                amountExpensesWithoutStockMutation.lastMonth
                  ? "Naik"
                  : "Turun"}{" "}
                {differenceAmountPercentageToString(
                  amountExpensesWithoutStockMutation.thisMonth,
                  amountExpensesWithoutStockMutation.lastMonth
                )}{" "}
                dari bulan lalu
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pembelian Barang
            </CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(amountExpensesWithStockMutation.total)}
            </div>
            <ul className="list-disc list-outside">
              <li className="text-xs text-muted-foreground">
                Bulan Ini:{" "}
                {formatCurrency(amountExpensesWithStockMutation.thisMonth)}
              </li>
              <li className="text-xs text-muted-foreground">
                Bulan Lalu:{" "}
                {formatCurrency(amountExpensesWithStockMutation.lastMonth)}
              </li>
              <li
                className={cn(
                  "text-xs text-muted-foreground",
                  amountExpensesWithStockMutation.thisMonth >=
                    amountExpensesWithStockMutation.lastMonth
                    ? "text-red-500"
                    : "text-green-500"
                )}
              >
                {amountExpensesWithStockMutation.thisMonth >=
                amountExpensesWithStockMutation.lastMonth
                  ? "Naik"
                  : "Turun"}{" "}
                {differenceAmountPercentageToString(
                  amountExpensesWithStockMutation.thisMonth,
                  amountExpensesWithStockMutation.lastMonth
                )}{" "}
                dari bulan lalu
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(amountExpenses.total)}
            </div>
            <ul className="list-disc list-outside">
              <li className="text-xs text-muted-foreground">
                Bulan Ini: {formatCurrency(amountExpenses.thisMonth)}
              </li>
              <li className="text-xs text-muted-foreground">
                Bulan Lalu: {formatCurrency(amountExpenses.lastMonth)}
              </li>
              <li
                className={cn(
                  "text-xs text-muted-foreground",
                  amountExpenses.thisMonth >= amountExpenses.lastMonth
                    ? "text-red-500"
                    : "text-green-500"
                )}
              >
                {amountExpenses.thisMonth >= amountExpenses.lastMonth
                  ? "Naik"
                  : "Turun"}{" "}
                {differenceAmountPercentageToString(
                  amountExpenses.thisMonth,
                  amountExpenses.lastMonth
                )}{" "}
                dari bulan lalu
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-min gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Pengeluaran Bulanan
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <DailyExpenseChart chartData={trendDaily} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Pengeluaran Terbaru
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

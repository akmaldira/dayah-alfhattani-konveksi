import { PageLabel } from "@/components/page-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function FinancePage() {
  const cashBalance = await prisma.cashBalance.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {},
  });

  const cashAuditLogs = await prisma.cashAuditLog.findMany({
    include: {
      transaction: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate summary statistics
  const today = new Date();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthLogs = cashAuditLogs.filter(
    (log) => new Date(log.createdAt) >= startOfMonth
  );

  const totalIncome = monthLogs
    .filter((log) => log.type === "INCOME")
    .reduce((sum, log) => sum + log.amount, 0);

  const totalExpense = monthLogs
    .filter((log) => log.type === "EXPENSE")
    .reduce((sum, log) => sum + log.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-20">
      <PageLabel label="Saldo Kas & Riwayat Transaksi" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Kas Saat Ini
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(cashBalance.balance)}
            </div>
            <p className="text-xs">Saldo aktual kas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pemasukan Bulan Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs">Total uang masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pengeluaran Bulan Ini
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs">Total uang keluar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <DollarSign
              className={`h-4 w-4 ${
                netCashFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netCashFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {netCashFlow >= 0 ? "+" : ""}
              {formatCurrency(netCashFlow)}
            </div>
            <p className="text-xs">
              {netCashFlow >= 0 ? "Surplus" : "Defisit"} bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards for Better Understanding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200 text-black">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Pemasukan (+)</span>
            </div>
            <p className="text-xs mt-1">
              Uang yang masuk ke kas dari penjualan, pendapatan lain
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 text-black">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">Pengeluaran (-)</span>
            </div>
            <p className="text-xs mt-1">
              Uang yang keluar untuk biaya operasional, pembelian
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200 text-black">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium">Adjustment (±)</span>
            </div>
            <p className="text-xs mt-1">
              Koreksi saldo kas, penyesuaian manual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table with Enhanced Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Riwayat Transaksi Kas
          </CardTitle>
          <p className="text-sm">
            Setiap baris menunjukkan perubahan saldo kas. Kolom &quot;Saldo
            Sebelum&quot; dan &quot;Saldo Setelah&quot; membantu melacak
            bagaimana setiap transaksi mempengaruhi kas.
          </p>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={cashAuditLogs} />
        </CardContent>
      </Card>
    </div>
  );
}

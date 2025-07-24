import { PageLabel } from "@/components/page-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Receipt, TrendingDown, TrendingUp, Users } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function TransactionPage() {
  const expenses = await prisma.transaction.findMany({
    include: {
      items: {
        include: {
          employee: true,
          mutation: {
            include: {
              unitConversion: true,
              variant: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalIncome = expenses
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpense = expenses
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalEmployeeLoan = expenses
    .filter((t) => t.type === "EMPLOYEE_LOAN")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const incomeCount = expenses.filter((t) => t.type === "INCOME").length;
  const expenseCount = expenses.filter((t) => t.type === "EXPENSE").length;
  const employeeLoanCount = expenses.filter(
    (t) => t.type === "EMPLOYEE_LOAN"
  ).length;

  return (
    <div className="space-y-6 pb-20">
      <PageLabel label="Riwayat Transaksi" />

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemasukan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs">{incomeCount} transaksi pemasukan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs">{expenseCount} transaksi pengeluaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ambilan Karyawan
            </CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(totalEmployeeLoan)}
            </div>
            <p className="text-xs">{employeeLoanCount} transaksi ambilan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {expenses.length}
            </div>
            <p className="text-xs">Semua jenis transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Type Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200 text-black">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Pemasukan</span>
            </div>
            <p className="text-xs mt-1">
              Uang masuk dari penjualan, pendapatan lain
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 text-black">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">Pengeluaran</span>
            </div>
            <p className="text-xs mt-1">Biaya operasional, pembelian barang</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200 text-black">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium">Ambilan Karyawan</span>
            </div>
            <p className="text-xs mt-1">Advance gaji, pinjaman karyawan</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table with Enhanced Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Daftar Transaksi
          </CardTitle>
          <p className="text-sm">
            Semua transaksi keuangan termasuk pemasukan, pengeluaran, dan
            ambilan karyawan. Gunakan filter untuk mencari transaksi tertentu.
          </p>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={expenses} />
        </CardContent>
      </Card>
    </div>
  );
}

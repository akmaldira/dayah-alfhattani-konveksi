import { PageLabel } from "@/components/page-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function StockMutationPage() {
  const items = await prisma.item.findMany({
    include: {
      variants: true,
      conversions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const stockMutations = await prisma.stockMutation.findMany({
    include: {
      unitConversion: true,
      variant: {
        include: {
          item: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const distinctItemNames = await prisma.item.findMany({
    select: {
      name: true,
    },
    distinct: ["name"],
  });

  // Calculate summary metrics
  const totalStockIn = stockMutations
    .filter((m) => m.type === "IN")
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalStockOut = stockMutations
    .filter((m) => m.type === "OUT")
    .reduce((sum, m) => sum + m.quantity, 0);

  // Get low stock items (assuming you have a minStock field)
  const lowStockItems = items.filter((item) =>
    item.variants.some((v) => v.currentStock < 10)
  ).length;

  return (
    <div className="pb-20 space-y-6">
      <PageLabel label="Riwayat Perubahan Stock" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Masuk
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStockIn.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total barang masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Keluar
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalStockOut.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total barang keluar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {items.length}
            </div>
            <p className="text-xs text-muted-foreground">Jenis barang</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Perlu restock</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={stockMutations}
        uniqueItemNames={distinctItemNames.map((item) => item.name)}
        items={items}
      />
    </div>
  );
}

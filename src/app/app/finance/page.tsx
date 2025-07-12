import { PageLabel } from "@/components/page-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
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

  return (
    <div className="space-y-4 pb-20">
      <PageLabel label="Keuangan" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(cashBalance.balance)}
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={cashAuditLogs} />
    </div>
  );
}

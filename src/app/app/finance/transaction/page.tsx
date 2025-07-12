import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function TransactionPage() {
  const expenses = await prisma.transaction.findMany({
    include: {
      items: {
        include: {
          mutation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <PageLabel label="Transaksi" />
      <DataTable columns={columns} data={expenses} />
    </div>
  );
}

import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import IncomeClient from "./client";

export default async function IncomePage() {
  const transactions = await prisma.transaction.findMany({
    where: {
      type: "INCOME",
    },
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
    <div className="space-y-4 mb-20">
      <PageLabel label="Pemasukan" />
      <IncomeClient transactions={transactions} />
    </div>
  );
}

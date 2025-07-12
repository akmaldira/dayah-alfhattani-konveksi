import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
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

  return (
    <div className="pb-20">
      <PageLabel label="Riwayat Perubahan Stock" />
      <DataTable
        columns={columns}
        data={stockMutations}
        uniqueItemNames={distinctItemNames.map((item) => item.name)}
        items={items}
      />
    </div>
  );
}

import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function ItemPage() {
  const items = await prisma.item.findMany({
    include: {
      variants: {
        orderBy: {
          createdAt: "desc",
        },
      },
      conversions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="pb-20">
      <PageLabel label="Barang & Varian" />
      <DataTable columns={columns} data={items} />
    </div>
  );
}

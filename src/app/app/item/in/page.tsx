import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import ItemInClient from "./client";

export default async function ItemInPage() {
  const items = await prisma.item.findMany({
    include: {
      variants: true,
      conversions: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div>
      <PageLabel label="Barang Masuk" />
      <ItemInClient items={items} />
    </div>
  );
}

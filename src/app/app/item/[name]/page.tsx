import { prisma } from "@/lib/prisma";
import ItemByUniqueNameClient from "./client";

type Params = Promise<{ name: string }>;

export default async function ItemByUniqueNamePage({
  params,
}: {
  params: Params;
}) {
  const { name } = await params;

  const item = await prisma.item.findUnique({
    where: {
      uniqueName: name,
    },
    include: {
      variants: true,
      conversions: true,
    },
  });

  return (
    <div className="pb-20">
      <ItemByUniqueNameClient item={item ?? undefined} />
    </div>
  );
}

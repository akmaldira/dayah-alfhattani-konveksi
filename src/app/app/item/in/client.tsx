import { ItemWithRelations } from "@/types/prisma";
import { AddStockDialog } from "./add-stock-dialog";

export default function ItemInClient({
  items,
}: {
  items: ItemWithRelations[];
}) {
  return (
    <div>
      <AddStockDialog items={items} />
    </div>
  );
}

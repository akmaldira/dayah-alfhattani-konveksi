"use client";

import { TransactionWithRelations } from "@/types/prisma";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

export default function IncomeClient({
  transactions,
}: {
  transactions: TransactionWithRelations[];
}) {
  return <DataTable columns={createColumns()} data={transactions} />;
}

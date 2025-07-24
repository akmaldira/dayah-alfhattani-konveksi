"use client";

import { Employee } from "@/lib/prisma/generated";
import { DailyWorkWithRelations } from "@/types/prisma";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

export default function DailyWorkClient({
  dailyWorks,
  employees,
}: {
  dailyWorks: DailyWorkWithRelations[];
  employees: Employee[];
}) {
  return (
    <DataTable
      columns={createColumns(employees)}
      data={dailyWorks}
      employees={employees}
    />
  );
}

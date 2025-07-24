"use client";

import { Employee } from "@/lib/prisma/generated";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

export default function SalaryClient({
  transactions,
  employees,
}: {
  transactions: EmployeeSalaryTransaction[];
  employees: Employee[];
}) {
  return (
    <DataTable
      columns={createColumns(employees)}
      data={transactions}
      employees={employees}
    />
  );
}

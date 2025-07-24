"use client";

import {
  EmployeeAttendanceWithRelations,
  EmployeeWithRelations,
} from "@/types/prisma";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

export default function EmployeeAttendanceClient({
  employees,
  employeeAttendances,
}: {
  employees: EmployeeWithRelations[];
  employeeAttendances: EmployeeAttendanceWithRelations[];
}) {
  return (
    <DataTable
      columns={createColumns(employees)}
      data={employeeAttendances}
      employees={employees}
    />
  );
}

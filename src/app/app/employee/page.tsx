import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function EmployeePage() {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-4 pb-20">
      <PageLabel label="Karyawan" />
      <DataTable columns={columns} data={employees} />
    </div>
  );
}

import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import SalaryClient from "./client";

export default async function Salary() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const transactions = await prisma.transaction.findMany({
    where: {
      type: "EMPLOYEE_LOAN",
    },
    include: {
      items: {
        include: {
          employee: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="space-y-4 mb-20">
      <PageLabel label="Ambilan Karyawan" />
      <SalaryClient transactions={transactions} employees={employees} />
    </div>
  );
}

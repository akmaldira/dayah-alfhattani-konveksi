import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import DailyWorkClient from "./client";

export default async function DailyWork() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const dailyWorks = await prisma.dailyWork.findMany({
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-4 pb-20">
      <PageLabel label="Pekerjaan Harian" />
      <DailyWorkClient dailyWorks={dailyWorks} employees={employees} />
    </div>
  );
}

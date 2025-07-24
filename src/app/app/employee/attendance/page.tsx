import { PageLabel } from "@/components/page-label";
import { prisma } from "@/lib/prisma";
import EmployeeAttendanceClient from "./client";

export default async function EmployeeAttendancePage() {
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
  });
  const employeeAttendances = await prisma.employeeAttendance.findMany({
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      <PageLabel label="Kehadiran Karyawan" />
      <EmployeeAttendanceClient
        employees={employees}
        employeeAttendances={employeeAttendances}
      />
    </div>
  );
}

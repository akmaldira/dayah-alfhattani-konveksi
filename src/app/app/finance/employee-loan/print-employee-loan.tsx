"use client";

import { getEmployeeLoanAction } from "@/action/salary-action";
import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { saveAs } from "file-saver";
import React from "react";
import * as XLSX from "xlsx";

export default function PrintEmployeeLoan() {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [toDate, setToDate] = React.useState<Date | undefined>(
    endOfMonth(new Date())
  );
  const employeeLoanService = useQuery({
    queryKey: ["employee-loan", fromDate, toDate],
    queryFn: async () => {
      const response = await getEmployeeLoanAction(fromDate, toDate);
      if (response.status === "success") {
        return response.data;
      }
      return [];
    },
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function handleDownload(data: EmployeeSalaryTransaction[]) {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        karyawan: item.items[0].employee?.name ?? "-",
        jumlah: formatCurrency(item.totalAmount),
        tanggal: formatDate(item.createdAt),
        keterangan: item.note ?? "-",
      }))
    );

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Create binary buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save the file
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `ambilan-karyawan-${formatDate(new Date())}.xlsx`);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Download</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download</DialogTitle>
          <DialogDescription>
            Download atau Cetak data ambilan karyawan
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 items-center">
            <h4>Tanggal Awal</h4>
            <DateTimePicker value={fromDate} onValueChange={setFromDate} />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h4>Tanggal Akhir</h4>
            <DateTimePicker value={toDate} onValueChange={setToDate} />
          </div>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeLoanService.isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {employeeLoanService.error && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {employeeLoanService.error.message}
                  </TableCell>
                </TableRow>
              )}
              {employeeLoanService.data ? (
                employeeLoanService.data.length < 1 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeLoanService.data.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.items[0].employee?.name ?? "-"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.items[0].totalPrice)}
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="max-w-[150px] truncate print:max-w-[200px] print:text-xs print:truncate">
                        {item.note ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : null}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button
            onClick={() => handleDownload(employeeLoanService.data ?? [])}
            className="w-full"
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

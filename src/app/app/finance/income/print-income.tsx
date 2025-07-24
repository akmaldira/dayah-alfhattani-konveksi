"use client";

import { getTransactionsAction } from "@/action/transaction-action";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { saveAs } from "file-saver";
import React from "react";
import * as XLSX from "xlsx";

export default function PrintIncome() {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [toDate, setToDate] = React.useState<Date | undefined>(
    endOfMonth(new Date())
  );
  const incomeService = useQuery({
    queryKey: ["income", fromDate, toDate],
    queryFn: async () => {
      const response = await getTransactionsAction(fromDate, toDate, "INCOME");
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
        pemasukan: item.source || "",
        item: item.items
          .map((item) => `${item.name} (Quantity: ${item.quantity})`)
          .join(", "),
        jumlah: formatCurrency(item.totalAmount),
        tanggal: formatDate(item.createdAt),
        keterangan: item.note,
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
    saveAs(blob, `pemasukan-${formatDate(new Date())}.xlsx`);
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
            Download atau Cetak data pemasukan
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
        <DialogFooter>
          <Button
            onClick={() => handleDownload(incomeService.data ?? [])}
            className="w-full"
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

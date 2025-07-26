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
import { exportToExcel } from "@/lib/excel-utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmployeeSalaryTransaction } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import React from "react";

export default function PrintIncome() {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [toDate, setToDate] = React.useState<Date | undefined>(
    endOfMonth(new Date())
  );
  const [isExporting, setIsExporting] = React.useState(false);
  
  const employeeLoanService = useQuery({
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

  async function handleDownload(data: EmployeeSalaryTransaction[]) {
    setIsExporting(true);
    try {
      const exportData = data.map((item) => ({
        customer: item.source || "",
        item: item.items
          .map((item) => `${item.name} (Quantity: ${item.quantity})`)
          .join(", "),
        jumlah: formatCurrency(item.totalAmount),
        tanggal: formatDate(item.createdAt),
        keterangan: item.note || "",
      }));

      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      await exportToExcel({
        data: exportData,
        filename: `income-report-${dateString}.xlsx`,
        sheetName: "Income Report",
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Export Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Income Report</DialogTitle>
          <DialogDescription>
            Choose date range for the income report
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="from-date" className="text-right">
              From Date
            </label>
            <div className="col-span-3">
              <DateTimePicker
                value={fromDate}
                onValueChange={setFromDate}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="to-date" className="text-right">
              To Date
            </label>
            <div className="col-span-3">
              <DateTimePicker
                value={toDate}
                onValueChange={setToDate}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => handleDownload(employeeLoanService.data || [])}
            disabled={!employeeLoanService.data || isExporting}
          >
            {isExporting ? "Exporting..." : "Download Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

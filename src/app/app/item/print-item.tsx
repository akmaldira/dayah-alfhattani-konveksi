"use client";

import { getItemsAction } from "@/action/item-action";
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
import { formatDate } from "@/lib/utils";
import { ItemWithRelations } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import React from "react";
import * as XLSX from "xlsx";

export default function PrintIetm() {
  const employeeLoanService = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await getItemsAction();
      if (response.status === "success") {
        return response.data;
      }
      return [];
    },
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function handleDownload(data: ItemWithRelations[]) {
    const allRecords = data.flatMap((item) =>
      item.variants.map((variant) => ({
        name: `${item.name} - ${variant.name}`,
        stock: variant.currentStock,
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(allRecords);

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
    saveAs(blob, `item-${formatDate(new Date())}.xlsx`);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Download</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download</DialogTitle>
          <DialogDescription>Download atau Cetak data item</DialogDescription>
        </DialogHeader>
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

// Shared utility for lazy loading Excel export functionality
export const loadExcelLibraries = async () => {
  const [{ default: XLSX }, { saveAs }] = await Promise.all([
    import("xlsx"),
    import("file-saver"),
  ]);
  return { XLSX, saveAs };
};

export interface ExcelExportOptions {
  data: any[];
  filename: string;
  sheetName?: string;
  dateFormat?: string;
}

export async function exportToExcel({
  data,
  filename,
  sheetName = "Sheet1",
}: ExcelExportOptions): Promise<void> {
  const { XLSX, saveAs } = await loadExcelLibraries();
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  saveAs(blob, filename);
}
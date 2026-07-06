import ExcelJS from "exceljs";
import type { ReportData } from "./reports.service";

const COLORS = {
  primary: "1a1a2e",
  accent: "e2e8f0",
  white: "ffffff",
  border: "cbd5e1",
};

export class ExportService {
  async toExcel(data: ReportData): Promise<Uint8Array> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistema Asistencia CCB";
    const sheet = workbook.addWorksheet("Reporte");

    sheet.columns = data.headers.map((h) => ({ header: h, key: h, width: h === "Nombre" ? 30 : 20 }));

    const titleRow = sheet.addRow([data.title]);
    titleRow.font = { bold: true, size: 14, color: { argb: COLORS.primary } };
    sheet.mergeCells(`A1:${String.fromCharCode(64 + data.headers.length)}1`);

    const subtitleRow = sheet.addRow([data.subtitle]);
    subtitleRow.font = { size: 11, color: { argb: "64748b" } };
    sheet.mergeCells(`A2:${String.fromCharCode(64 + data.headers.length)}2`);

    sheet.addRow([]);

    const headerRow = sheet.addRow(data.headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLORS.white } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });

    data.rows.forEach((row, idx) => {
      const excelRow = sheet.addRow(row);
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: COLORS.border } },
          bottom: { style: "thin", color: { argb: COLORS.border } },
          left: { style: "thin", color: { argb: COLORS.border } },
          right: { style: "thin", color: { argb: COLORS.border } },
        };
        if (idx % 2 === 0) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.accent } };
        }
      });
    });

    sheet.addRow([]);
    const summaryRow = sheet.addRow([`Total: ${data.summary.total}`]);
    summaryRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer as ArrayBuffer);
  }

  toHtml(data: ReportData): string {
    const rowsHtml = data.rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { color: #1a1a2e; font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1a1a2e; color: white; padding: 8px 12px; text-align: left; }
          td { padding: 6px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
          .summary { margin-top: 20px; font-weight: bold; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <p class="subtitle">${data.subtitle}</p>
        <table>
          <thead><tr>${data.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <p class="summary">Total: ${data.summary.total}</p>
      </body>
      </html>
    `;
  }
}

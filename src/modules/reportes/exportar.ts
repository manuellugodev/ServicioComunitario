import "server-only";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Reporte } from "@/modules/reportes/schemas";

export async function aExcel(reporte: Reporte, nombreConsejo: string, fecha: string) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet(reporte.titulo.slice(0, 31));

  hoja.addRow([nombreConsejo]).font = { bold: true };
  hoja.addRow([reporte.titulo]).font = { bold: true };
  hoja.addRow([[`Fecha: ${fecha}`, ...reporte.filtros].join(" · ")]);
  hoja.addRow([]);
  hoja.addRow(reporte.columnas).font = { bold: true };
  hoja.addRows(reporte.filas);

  hoja.columns.forEach((columna, indice) => {
    const anchos = reporte.filas.map((fila) => String(fila[indice] ?? "").length);
    columna.width = Math.min(Math.max(reporte.columnas[indice]?.length ?? 0, ...anchos, 8) + 2, 45);
  });

  return new Uint8Array(await libro.xlsx.writeBuffer());
}

export function aPdf(reporte: Reporte, nombreConsejo: string, fecha: string) {
  const documento = new jsPDF({ orientation: "landscape", format: "a4", unit: "pt" });
  const margen = 36;

  documento.setFont("helvetica", "bold");
  documento.setFontSize(13);
  documento.text(nombreConsejo, margen, margen);
  documento.setFontSize(11);
  documento.text(reporte.titulo, margen, margen + 18);
  documento.setFont("helvetica", "normal");
  documento.setFontSize(9);
  documento.text(
    [`Fecha: ${fecha}`, ...reporte.filtros, `Total: ${reporte.filas.length}`].join("  ·  "),
    margen,
    margen + 34
  );

  autoTable(documento, {
    startY: margen + 44,
    margin: { left: margen, right: margen },
    head: [reporte.columnas],
    body: reporte.filas,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [38, 38, 38] },
  });

  return new Uint8Array(documento.output("arraybuffer"));
}

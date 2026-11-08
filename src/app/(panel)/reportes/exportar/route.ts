import type { NextRequest } from "next/server";
import { obtenerNombreConsejo } from "@/modules/configuracion/queries";
import { aExcel, aPdf } from "@/modules/reportes/exportar";
import { generarReporte, leerFiltros } from "@/modules/reportes/queries";
import { hoyEnCaracas } from "@/shared/lib/fechas";

const FORMATOS = {
  pdf: { tipo: "application/pdf", generar: aPdf },
  xlsx: {
    tipo: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    generar: aExcel,
  },
} as const;

export async function GET(request: NextRequest) {
  const parametros = Object.fromEntries(request.nextUrl.searchParams);
  const extension = parametros.formato;
  if (extension !== "pdf" && extension !== "xlsx") {
    return new Response("Formato no válido.", { status: 400 });
  }

  const reporte = await generarReporte(leerFiltros(parametros));
  const nombreConsejo = await obtenerNombreConsejo();
  const fecha = hoyEnCaracas();
  const { tipo, generar } = FORMATOS[extension];
  const archivo = await generar(reporte, nombreConsejo, fecha);

  return new Response(archivo, {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `attachment; filename="reporte-${reporte.tipo}-${fecha}.${extension}"`,
      "Cache-Control": "no-store",
    },
  });
}

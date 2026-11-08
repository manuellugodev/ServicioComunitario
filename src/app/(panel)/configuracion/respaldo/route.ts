import { generarRespaldo } from "@/modules/configuracion/respaldo";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import { hoyEnCaracas } from "@/shared/lib/fechas";
import { requerirAdmin } from "@/shared/lib/sesion";

export async function GET() {
  const sesion = await requerirAdmin();

  let archivo: Uint8Array<ArrayBuffer>;
  try {
    archivo = await generarRespaldo();
  } catch (error) {
    console.error("No se pudo generar el respaldo", error);
    return new Response("No se pudo generar el respaldo.", { status: 500 });
  }

  await registrarBitacora(db, {
    usuarioId: sesion.id,
    accion: "RESPALDO",
    tabla: "base_de_datos",
    registroId: 0,
  });

  return new Response(archivo, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="respaldo-censo-${hoyEnCaracas()}.dump"`,
      "Cache-Control": "no-store",
    },
  });
}

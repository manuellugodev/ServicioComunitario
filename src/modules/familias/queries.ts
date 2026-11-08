import "server-only";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

export async function listarFamiliasDeVivienda(viviendaId: number) {
  await requerirSesion();
  return db.nucleoFamiliar.findMany({
    where: { viviendaId },
    orderBy: { id: "asc" },
    select: { id: true, recibeClap: true },
  });
}

export async function obtenerFamilia(id: number) {
  await requerirSesion();
  const familia = await db.nucleoFamiliar.findUnique({
    where: { id },
    include: {
      vivienda: {
        select: {
          id: true,
          codigo: true,
          direccion: true,
          sector: { select: { nombre: true } },
        },
      },
    },
  });
  // Decimal no se puede enviar a los componentes de cliente.
  return familia && { ...familia, ingresoAproxUsd: familia.ingresoAproxUsd?.toString() ?? null };
}

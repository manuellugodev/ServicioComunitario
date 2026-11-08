import "server-only";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

const POR_PAGINA = 20;

export async function listarViviendas(filtros: { sectorId?: number; pagina: number }) {
  await requerirSesion();

  const where = { sectorId: filtros.sectorId };
  const total = await db.vivienda.count({ where });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);

  const viviendas = await db.vivienda.findMany({
    where,
    orderBy: { id: "asc" },
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
    select: {
      id: true,
      codigo: true,
      direccion: true,
      sector: { select: { nombre: true } },
      tipoVivienda: { select: { nombre: true } },
    },
  });

  return { viviendas, total, pagina, paginas };
}

export async function obtenerVivienda(id: number) {
  await requerirSesion();
  return db.vivienda.findUnique({
    where: { id },
    include: {
      sector: { select: { nombre: true } },
      tipoVivienda: { select: { nombre: true } },
    },
  });
}

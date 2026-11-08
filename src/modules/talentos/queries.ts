import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { Nivel } from "@/modules/talentos/schemas";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

const POR_PAGINA = 20;

export async function listarTalentos() {
  await requerirSesion();
  return db.talento.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      categoriaId: true,
      categoria: { select: { nombre: true } },
    },
  });
}

export async function listarTalentosDeHabitante(habitanteId: number) {
  await requerirSesion();
  return db.habitanteTalento.findMany({
    where: { habitanteId },
    orderBy: { talento: { nombre: "asc" } },
    select: {
      talentoId: true,
      nivel: true,
      aniosExperiencia: true,
      certificado: true,
      disponible: true,
      talento: { select: { nombre: true, categoria: { select: { nombre: true } } } },
    },
  });
}

type Filtros = {
  categoriaId?: number;
  talentoId?: number;
  sectorId?: number;
  nivel?: Nivel;
  disponible?: boolean;
  pagina: number;
};

export async function buscarVecinosPorTalento(filtros: Filtros) {
  await requerirSesion();

  const where: Prisma.HabitanteTalentoWhereInput = {
    talentoId: filtros.talentoId,
    nivel: filtros.nivel,
    disponible: filtros.disponible,
    talento: filtros.categoriaId ? { categoriaId: filtros.categoriaId } : undefined,
    habitante: {
      estado: "ACTIVO",
      nucleo: filtros.sectorId ? { vivienda: { sectorId: filtros.sectorId } } : undefined,
    },
  };

  const total = await db.habitanteTalento.count({ where });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);

  const resultados = await db.habitanteTalento.findMany({
    where,
    orderBy: [
      { habitante: { apellidos: "asc" } },
      { habitante: { nombres: "asc" } },
      { habitanteId: "asc" },
      { talentoId: "asc" },
    ],
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
    select: {
      habitanteId: true,
      talentoId: true,
      nivel: true,
      aniosExperiencia: true,
      certificado: true,
      disponible: true,
      talento: { select: { nombre: true, categoria: { select: { nombre: true } } } },
      habitante: {
        select: {
          nombres: true,
          apellidos: true,
          telefono: true,
          nucleo: {
            select: {
              vivienda: {
                select: { direccion: true, sector: { select: { nombre: true } } },
              },
            },
          },
        },
      },
    },
  });

  return { resultados, total, pagina, paginas };
}

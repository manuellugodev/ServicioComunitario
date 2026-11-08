import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ESTADOS } from "@/modules/habitantes/schemas";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

const POR_PAGINA = 20;

type Estado = (typeof ESTADOS)[number];

type Filtros = {
  texto: string;
  sectorId?: number;
  estado?: Estado;
  pagina: number;
};

function condicionDe(palabra: string): Prisma.HabitanteWhereInput {
  const alternativas: Prisma.HabitanteWhereInput[] = [
    { nombres: { contains: palabra, mode: "insensitive" } },
    { apellidos: { contains: palabra, mode: "insensitive" } },
    { nucleo: { vivienda: { codigo: { contains: palabra, mode: "insensitive" } } } },
  ];
  if (/^[VE]?[\d.-]+$/i.test(palabra)) {
    alternativas.push({ cedula: { contains: palabra.replace(/\D/g, "") } });
  }
  return { OR: alternativas };
}

export async function buscarHabitantes({ texto, sectorId, estado, pagina: solicitada }: Filtros) {
  await requerirSesion();

  const where: Prisma.HabitanteWhereInput = {
    estado,
    nucleo: sectorId ? { vivienda: { sectorId } } : undefined,
    AND: texto.split(/\s+/).filter(Boolean).map(condicionDe),
  };

  const total = await db.habitante.count({ where });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(solicitada, paginas);

  const habitantes = await db.habitante.findMany({
    where,
    orderBy: [{ apellidos: "asc" }, { nombres: "asc" }, { id: "asc" }],
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
    select: {
      id: true,
      nacionalidad: true,
      cedula: true,
      nombres: true,
      apellidos: true,
      fechaNacimiento: true,
      estado: true,
      nucleo: {
        select: {
          vivienda: { select: { codigo: true, sector: { select: { nombre: true } } } },
        },
      },
    },
  });

  return { habitantes, total, pagina, paginas };
}

export async function listarMiembros(nucleoId: number) {
  await requerirSesion();
  return db.habitante.findMany({
    where: { nucleoId },
    orderBy: [{ parentesco: "asc" }, { id: "asc" }],
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      fechaNacimiento: true,
      parentesco: true,
      estado: true,
    },
  });
}

export async function familiaTieneJefe(nucleoId: number) {
  await requerirSesion();
  const jefes = await db.habitante.count({
    where: { nucleoId, parentesco: "JEFE", estado: "ACTIVO" },
  });
  return jefes > 0;
}

export async function obtenerHabitante(id: number) {
  await requerirSesion();
  return db.habitante.findUnique({
    where: { id },
    include: {
      nucleo: {
        select: {
          id: true,
          vivienda: { select: { id: true, codigo: true, sector: { select: { nombre: true } } } },
        },
      },
    },
  });
}

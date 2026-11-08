import "server-only";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

const MAXIMO_SUGERIDOS = 10;

export async function listarProyectos() {
  await requerirSesion();
  return db.proyecto.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      estado: true,
      fechaInicio: true,
      fechaFin: true,
      responsable: { select: { nombreCompleto: true } },
      talentos: { select: { cantidadRequerida: true, _count: { select: { participantes: true } } } },
    },
  });
}

export async function obtenerProyecto(id: number) {
  await requerirSesion();
  return db.proyecto.findUnique({
    where: { id },
    include: {
      responsable: { select: { nombreCompleto: true } },
      talentos: {
        orderBy: { talento: { nombre: "asc" } },
        select: {
          talentoId: true,
          cantidadRequerida: true,
          talento: { select: { nombre: true, categoria: { select: { nombre: true } } } },
          _count: { select: { participantes: true } },
          participantes: {
            orderBy: [{ posesion: { habitante: { apellidos: "asc" } } }],
            select: {
              habitanteId: true,
              rol: true,
              fechaAsignacion: true,
              posesion: {
                select: {
                  habitante: {
                    select: { nombres: true, apellidos: true, telefono: true, estado: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function sugerirVecinos(proyectoId: number, talentoId: number) {
  await requerirSesion();
  return db.habitanteTalento.findMany({
    where: {
      talentoId,
      disponible: true,
      habitante: { estado: "ACTIVO" },
      participaciones: { none: { proyectoId } },
    },
    orderBy: [{ nivel: "desc" }, { aniosExperiencia: "desc" }, { habitanteId: "asc" }],
    take: MAXIMO_SUGERIDOS,
    select: {
      habitanteId: true,
      nivel: true,
      aniosExperiencia: true,
      certificado: true,
      habitante: {
        select: {
          nombres: true,
          apellidos: true,
          telefono: true,
          nucleo: { select: { vivienda: { select: { sector: { select: { nombre: true } } } } } },
        },
      },
    },
  });
}

import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ETIQUETAS_NIVEL_TALENTO } from "@/modules/talentos/schemas";
import { ETIQUETAS_SEXO, formatoCedula } from "@/modules/habitantes/schemas";
import {
  EDAD_ADULTO_MAYOR,
  ETAPAS,
  TIPOS_REPORTE,
  type Filtros,
  type Reporte,
  type TipoReporte,
} from "@/modules/reportes/schemas";
import { aIdPositivo } from "@/shared/lib/acciones";
import { db } from "@/shared/lib/db";
import { calcularEdad, fechaDeCumplir } from "@/shared/lib/fechas";
import { requerirSesion } from "@/shared/lib/sesion";

const SIN_DATO = "-";
const ANCHO_GRUPO_EDAD = 5;
const ULTIMO_GRUPO_EDAD = 80;

export function leerFiltros(parametros: Record<string, string | string[] | undefined>): Filtros {
  const tipo = TIPOS_REPORTE.find(({ id }) => id === parametros.reporte)?.id ?? TIPOS_REPORTE[0].id;
  return {
    tipo,
    sectorId: aIdPositivo(parametros.sector) ?? undefined,
    categoriaId: aIdPositivo(parametros.categoria) ?? undefined,
    etapa: ETAPAS.find(({ id }) => id === parametros.etapa),
  };
}

function rangoDeEdad(minima: number, maxima?: number): Prisma.DateTimeFilter {
  const filtro: Prisma.DateTimeFilter = { lte: fechaDeCumplir(minima) };
  if (maxima !== undefined) {
    filtro.gt = fechaDeCumplir(maxima + 1);
  }
  return filtro;
}

const CAMPOS_HABITANTE = {
  nombres: true,
  apellidos: true,
  nacionalidad: true,
  cedula: true,
  fechaNacimiento: true,
  sexo: true,
  telefono: true,
  estudiaActualmente: true,
  discapacidad: true,
  nucleo: {
    select: { vivienda: { select: { codigo: true, sector: { select: { nombre: true } } } } },
  },
} as const;

const ORDEN_HABITANTE = [{ apellidos: "asc" }, { nombres: "asc" }, { id: "asc" }] as const;

function etapaDeEdad(edad: number) {
  return ETAPAS.find(({ minima, maxima }) => edad >= minima && edad <= maxima)?.etiqueta ?? SIN_DATO;
}

function condicionBase(sectorId?: number): Prisma.HabitanteWhereInput {
  return {
    estado: "ACTIVO",
    nucleo: sectorId ? { vivienda: { sectorId } } : undefined,
  };
}

type FilasPorTipo = Pick<Reporte, "columnas" | "filas">;

async function adultosMayores({ sectorId }: Filtros): Promise<FilasPorTipo> {
  const habitantes = await db.habitante.findMany({
    where: { ...condicionBase(sectorId), fechaNacimiento: rangoDeEdad(EDAD_ADULTO_MAYOR) },
    orderBy: [...ORDEN_HABITANTE],
    select: CAMPOS_HABITANTE,
  });
  return {
    columnas: ["Nombre", "Cédula", "Edad", "Sexo", "Sector", "Vivienda", "Teléfono"],
    filas: habitantes.map((h) => [
      `${h.apellidos}, ${h.nombres}`,
      formatoCedula(h.nacionalidad, h.cedula),
      calcularEdad(h.fechaNacimiento),
      ETIQUETAS_SEXO[h.sexo],
      h.nucleo.vivienda.sector.nombre,
      h.nucleo.vivienda.codigo,
      h.telefono ?? SIN_DATO,
    ]),
  };
}

async function discapacidad({ sectorId }: Filtros): Promise<FilasPorTipo> {
  const habitantes = await db.habitante.findMany({
    where: { ...condicionBase(sectorId), discapacidad: { not: null } },
    orderBy: [...ORDEN_HABITANTE],
    select: CAMPOS_HABITANTE,
  });
  return {
    columnas: ["Nombre", "Cédula", "Edad", "Discapacidad", "Sector", "Vivienda", "Teléfono"],
    filas: habitantes.map((h) => [
      `${h.apellidos}, ${h.nombres}`,
      formatoCedula(h.nacionalidad, h.cedula),
      calcularEdad(h.fechaNacimiento),
      h.discapacidad ?? SIN_DATO,
      h.nucleo.vivienda.sector.nombre,
      h.nucleo.vivienda.codigo,
      h.telefono ?? SIN_DATO,
    ]),
  };
}

// Para el rol Consulta: solo totales por sector, sin identificar a nadie.
async function discapacidadTotales({ sectorId }: Filtros): Promise<FilasPorTipo> {
  const habitantes = await db.habitante.findMany({
    where: { ...condicionBase(sectorId), discapacidad: { not: null } },
    select: { nucleo: { select: { vivienda: { select: { sector: { select: { nombre: true } } } } } } },
  });

  const porSector = new Map<string, number>();
  for (const { nucleo } of habitantes) {
    const sector = nucleo.vivienda.sector.nombre;
    porSector.set(sector, (porSector.get(sector) ?? 0) + 1);
  }

  return {
    columnas: ["Sector", "Personas con discapacidad"],
    filas: [...porSector].sort(([a], [b]) => a.localeCompare(b, "es")),
  };
}

async function edadEscolar({ sectorId, etapa }: Filtros): Promise<FilasPorTipo> {
  const minima = etapa?.minima ?? ETAPAS[0].minima;
  const maxima = etapa?.maxima ?? ETAPAS[ETAPAS.length - 1].maxima;
  const habitantes = await db.habitante.findMany({
    where: { ...condicionBase(sectorId), fechaNacimiento: rangoDeEdad(minima, maxima) },
    orderBy: [...ORDEN_HABITANTE],
    select: CAMPOS_HABITANTE,
  });
  return {
    columnas: ["Nombre", "Cédula", "Edad", "Etapa", "Estudia", "Sector", "Vivienda"],
    filas: habitantes.map((h) => {
      const edad = calcularEdad(h.fechaNacimiento);
      return [
        `${h.apellidos}, ${h.nombres}`,
        formatoCedula(h.nacionalidad, h.cedula),
        edad,
        etapaDeEdad(edad),
        h.estudiaActualmente ? "Sí" : "No",
        h.nucleo.vivienda.sector.nombre,
        h.nucleo.vivienda.codigo,
      ];
    }),
  };
}

async function talentos({ sectorId, categoriaId }: Filtros): Promise<FilasPorTipo> {
  const registros = await db.habitanteTalento.findMany({
    where: {
      talento: categoriaId ? { categoriaId } : undefined,
      habitante: condicionBase(sectorId),
    },
    orderBy: [
      { talento: { categoria: { nombre: "asc" } } },
      { talento: { nombre: "asc" } },
      { habitante: { apellidos: "asc" } },
      { habitanteId: "asc" },
    ],
    select: {
      nivel: true,
      aniosExperiencia: true,
      disponible: true,
      talento: { select: { nombre: true, categoria: { select: { nombre: true } } } },
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
  return {
    columnas: ["Área", "Talento", "Nombre", "Nivel", "Años", "Disponible", "Teléfono", "Sector"],
    filas: registros.map((r) => [
      r.talento.categoria.nombre,
      r.talento.nombre,
      `${r.habitante.apellidos}, ${r.habitante.nombres}`,
      ETIQUETAS_NIVEL_TALENTO[r.nivel],
      r.aniosExperiencia,
      r.disponible ? "Sí" : "No",
      r.habitante.telefono ?? SIN_DATO,
      r.habitante.nucleo.vivienda.sector.nombre,
    ]),
  };
}

const GENERADORES: Record<TipoReporte, (filtros: Filtros) => Promise<FilasPorTipo>> = {
  "adultos-mayores": adultosMayores,
  discapacidad,
  "edad-escolar": edadEscolar,
  talentos,
};

async function describirFiltros({ sectorId, categoriaId, etapa, tipo }: Filtros) {
  const [sector, categoria] = await Promise.all([
    sectorId ? db.sector.findUnique({ where: { id: sectorId } }) : null,
    categoriaId && tipo === "talentos"
      ? db.categoriaTalento.findUnique({ where: { id: categoriaId } })
      : null,
  ]);
  return [
    sector && `Sector: ${sector.nombre}`,
    categoria && `Área: ${categoria.nombre}`,
    etapa && tipo === "edad-escolar" && `Etapa: ${etapa.etiqueta}`,
  ].filter((texto): texto is string => Boolean(texto));
}

export async function generarReporte(filtros: Filtros): Promise<Reporte> {
  const { rol } = await requerirSesion();
  const generador =
    filtros.tipo === "discapacidad" && rol === "CONSULTA"
      ? discapacidadTotales
      : GENERADORES[filtros.tipo];

  const [datos, descripcion] = await Promise.all([generador(filtros), describirFiltros(filtros)]);

  return {
    tipo: filtros.tipo,
    titulo: TIPOS_REPORTE.find(({ id }) => id === filtros.tipo)!.titulo,
    filtros: descripcion,
    ...datos,
  };
}

function etiquetaGrupo(inicio: number) {
  return inicio >= ULTIMO_GRUPO_EDAD ? `${ULTIMO_GRUPO_EDAD}+` : `${inicio}-${inicio + ANCHO_GRUPO_EDAD - 1}`;
}

export async function obtenerResumen() {
  await requerirSesion();

  const [viviendas, familias, habitantes, talentos, proyectos, categorias] = await Promise.all([
    db.vivienda.count(),
    db.nucleoFamiliar.count(),
    db.habitante.findMany({
      where: { estado: "ACTIVO" },
      select: { fechaNacimiento: true, sexo: true },
    }),
    db.habitanteTalento.count({ where: { habitante: { estado: "ACTIVO" } } }),
    db.proyecto.count({ where: { estado: "EN_EJECUCION" } }),
    db.categoriaTalento.findMany({
      select: {
        nombre: true,
        talentos: {
          select: {
            _count: { select: { habitantes: { where: { habitante: { estado: "ACTIVO" } } } } },
          },
        },
      },
    }),
  ]);

  const inicios = Array.from(
    { length: ULTIMO_GRUPO_EDAD / ANCHO_GRUPO_EDAD + 1 },
    (_, indice) => indice * ANCHO_GRUPO_EDAD
  );
  const grupos = new Map(inicios.map((inicio) => [inicio, { mujeres: 0, hombres: 0 }]));

  for (const { fechaNacimiento, sexo } of habitantes) {
    const inicio = Math.min(
      Math.floor(calcularEdad(fechaNacimiento) / ANCHO_GRUPO_EDAD) * ANCHO_GRUPO_EDAD,
      ULTIMO_GRUPO_EDAD
    );
    const grupo = grupos.get(inicio)!;
    if (sexo === "F") {
      grupo.mujeres += 1;
    } else {
      grupo.hombres += 1;
    }
  }

  return {
    viviendas,
    familias,
    habitantes: habitantes.length,
    talentos,
    proyectos,
    piramide: [...inicios].reverse().map((inicio) => ({
      grupo: etiquetaGrupo(inicio),
      ...grupos.get(inicio)!,
    })),
    talentosPorCategoria: categorias
      .map(({ nombre, talentos: lista }) => ({
        nombre,
        total: lista.reduce((suma, { _count }) => suma + _count.habitantes, 0),
      }))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, "es")),
  };
}

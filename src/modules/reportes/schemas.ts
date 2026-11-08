export const TIPOS_REPORTE = [
  { id: "adultos-mayores", titulo: "Adultos mayores" },
  { id: "discapacidad", titulo: "Personas con discapacidad" },
  { id: "edad-escolar", titulo: "Niños y jóvenes en edad escolar" },
  { id: "talentos", titulo: "Talentos por área" },
] as const;

export type TipoReporte = (typeof TIPOS_REPORTE)[number]["id"];

export const EDAD_ADULTO_MAYOR = 60;

export const ETAPAS = [
  { id: "inicial", etiqueta: "Inicial", minima: 3, maxima: 5 },
  { id: "primaria", etiqueta: "Primaria", minima: 6, maxima: 11 },
  { id: "media", etiqueta: "Media", minima: 12, maxima: 17 },
] as const;

export type Filtros = {
  tipo: TipoReporte;
  sectorId?: number;
  categoriaId?: number;
  etapa?: (typeof ETAPAS)[number];
};

export type Reporte = {
  tipo: TipoReporte;
  titulo: string;
  filtros: string[];
  columnas: string[];
  filas: (string | number)[][];
};

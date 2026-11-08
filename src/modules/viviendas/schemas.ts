import { z } from "zod";

export const TENENCIAS = ["PROPIA", "ALQUILADA", "PRESTADA", "INVADIDA", "OTRA"] as const;

export const ETIQUETAS_TENENCIA: Record<(typeof TENENCIAS)[number], string> = {
  PROPIA: "Propia",
  ALQUILADA: "Alquilada",
  PRESTADA: "Prestada",
  INVADIDA: "Invadida",
  OTRA: "Otra",
};

export const SERVICIOS = [
  { campo: "agua", etiqueta: "Agua" },
  { campo: "electricidad", etiqueta: "Electricidad" },
  { campo: "gas", etiqueta: "Gas" },
  { campo: "aseo", etiqueta: "Aseo urbano" },
  { campo: "internet", etiqueta: "Internet" },
] as const;

const seleccion = (mensaje: string) => z.coerce.number(mensaje).int(mensaje).positive(mensaje);

const servicio = z
  .literal("on")
  .optional()
  .transform((valor) => valor === "on");

export const esquemaVivienda = z.object({
  sectorId: seleccion("Selecciona un sector."),
  tipoViviendaId: seleccion("Selecciona el tipo de vivienda."),
  direccion: z
    .string()
    .trim()
    .min(5, "Escribe la dirección o un punto de referencia.")
    .max(200, "La dirección no puede tener más de 200 caracteres."),
  tenencia: z.preprocess(
    (valor) => (valor === "" ? null : valor),
    z.enum(TENENCIAS, "Selecciona una tenencia válida.").nullable()
  ),
  agua: servicio,
  electricidad: servicio,
  gas: servicio,
  aseo: servicio,
  internet: servicio,
  observaciones: z
    .string()
    .trim()
    .max(2000, "Las observaciones no pueden tener más de 2000 caracteres.")
    .transform((valor) => valor || null),
});

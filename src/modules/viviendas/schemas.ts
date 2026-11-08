import { z } from "zod";
import { casilla, observaciones, seleccion } from "@/shared/lib/esquemas";

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
  agua: casilla,
  electricidad: casilla,
  gas: casilla,
  aseo: casilla,
  internet: casilla,
  observaciones,
});

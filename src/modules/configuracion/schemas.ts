import { z } from "zod";

export const ID_CONFIGURACION = 1;

export const CATALOGOS = ["sector", "tipo_vivienda"] as const;

export type Catalogo = (typeof CATALOGOS)[number];

export const esquemaCatalogo = z.enum(CATALOGOS);

export const esquemaElementoCatalogo = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe el nombre.")
    .max(80, "El nombre no puede tener más de 80 caracteres."),
});

export const esquemaNombreConsejo = z.object({
  nombreConsejo: z
    .string()
    .trim()
    .min(3, "Escribe el nombre del consejo comunal.")
    .max(120, "El nombre no puede tener más de 120 caracteres."),
});

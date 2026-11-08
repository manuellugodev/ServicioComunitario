import { z } from "zod";
import { casilla, seleccion } from "@/shared/lib/esquemas";

export const NIVELES = ["BASICO", "INTERMEDIO", "AVANZADO"] as const;

export type Nivel = (typeof NIVELES)[number];

export const ETIQUETAS_NIVEL_TALENTO: Record<Nivel, string> = {
  BASICO: "Básico",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

export const esquemaNivel = z.enum(NIVELES);

export const esquemaTalentoCatalogo = z.object({
  categoriaId: seleccion("Selecciona una categoría."),
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe el nombre del talento.")
    .max(80, "El nombre no puede tener más de 80 caracteres."),
});

export const esquemaDatosAsignacion = z.object({
  nivel: z.enum(NIVELES, "Selecciona el nivel."),
  aniosExperiencia: z.coerce
    .number("Escribe los años en números.")
    .int("Escribe los años en números enteros.")
    .min(0, "Los años no pueden ser negativos.")
    .max(80, "Revisa los años de experiencia."),
  certificado: casilla,
  disponible: casilla,
});

export const esquemaAsignacion = esquemaDatosAsignacion.extend({
  talentoId: seleccion("Selecciona un talento."),
});

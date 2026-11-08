import { z } from "zod";
import { fechaOpcional, seleccion } from "@/shared/lib/esquemas";

export const ESTADOS_PROYECTO = ["PROPUESTO", "EN_EJECUCION", "PAUSADO", "CULMINADO"] as const;

export const ETIQUETAS_ESTADO_PROYECTO: Record<(typeof ESTADOS_PROYECTO)[number], string> = {
  PROPUESTO: "Propuesto",
  EN_EJECUCION: "En ejecución",
  PAUSADO: "Pausado",
  CULMINADO: "Culminado",
};

export const esquemaProyecto = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, "Escribe el nombre del proyecto.")
      .max(150, "El nombre no puede tener más de 150 caracteres."),
    descripcion: z
      .string()
      .trim()
      .max(2000, "La descripción no puede tener más de 2000 caracteres.")
      .transform((valor) => valor || null),
    responsableId: seleccion("Selecciona un responsable."),
    fechaInicio: fechaOpcional,
    fechaFin: fechaOpcional,
    estado: z.enum(ESTADOS_PROYECTO, "Selecciona un estado."),
  })
  .refine(
    ({ fechaInicio, fechaFin }) => !fechaInicio || !fechaFin || fechaFin >= fechaInicio,
    { path: ["fechaFin"], message: "La fecha de fin no puede ser anterior a la de inicio." }
  );

const cantidadRequerida = z.coerce
  .number("Escribe la cantidad en números.")
  .int("Escribe la cantidad en números enteros.")
  .min(1, "La cantidad debe ser al menos 1.")
  .max(999, "Revisa la cantidad.");

export const esquemaCantidad = z.object({ cantidadRequerida });

export const esquemaRequerimiento = z.object({
  talentoId: seleccion("Selecciona un talento."),
  cantidadRequerida,
});

export const esquemaParticipante = z.object({
  rol: z
    .string()
    .trim()
    .max(80, "El rol no puede tener más de 80 caracteres.")
    .transform((valor) => valor || null),
});

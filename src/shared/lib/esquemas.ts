import { z } from "zod";

export const seleccion = (mensaje: string) => z.coerce.number(mensaje).int(mensaje).positive(mensaje);

export const casilla = z
  .literal("on")
  .optional()
  .transform((valor) => valor === "on");

export const fechaOpcional = z
  .string()
  .trim()
  .transform((valor, contexto) => {
    if (!valor) {
      return null;
    }
    const fecha = new Date(`${valor}T00:00:00.000Z`);
    const valida =
      /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
      !Number.isNaN(fecha.getTime()) &&
      fecha.toISOString().startsWith(valor);
    if (!valida) {
      contexto.addIssue({ code: "custom", message: "Escribe una fecha válida." });
      return z.NEVER;
    }
    return fecha;
  });

export const observaciones = z
  .string()
  .trim()
  .max(2000, "Las observaciones no pueden tener más de 2000 caracteres.")
  .transform((valor) => valor || null);

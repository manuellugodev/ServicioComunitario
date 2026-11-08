import { z } from "zod";

export const seleccion = (mensaje: string) => z.coerce.number(mensaje).int(mensaje).positive(mensaje);

export const casilla = z
  .literal("on")
  .optional()
  .transform((valor) => valor === "on");

export const observaciones = z
  .string()
  .trim()
  .max(2000, "Las observaciones no pueden tener más de 2000 caracteres.")
  .transform((valor) => valor || null);

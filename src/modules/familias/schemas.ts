import { z } from "zod";
import { casilla, observaciones } from "@/shared/lib/esquemas";

export const esquemaFamilia = z.object({
  ingresoAproxUsd: z
    .string()
    .trim()
    .regex(/^(\d{1,8}([.,]\d{1,2})?)?$/, "Escribe solo el monto en dólares, por ejemplo 150 o 150,50.")
    .transform((valor) => (valor ? valor.replace(",", ".") : null)),
  recibeClap: casilla,
  observaciones,
});

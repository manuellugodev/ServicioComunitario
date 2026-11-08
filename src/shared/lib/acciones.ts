import "server-only";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

export function aErrores(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}

export function sinContrasenas(formData: FormData) {
  const valores: Record<string, string> = {};
  for (const [clave, valor] of formData) {
    if (typeof valor === "string" && !clave.startsWith("$") && clave !== "contrasena") {
      valores[clave] = valor;
    }
  }
  return valores;
}

function tieneCodigo(error: unknown, codigo: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === codigo;
}

export const esDuplicado = (error: unknown) => tieneCodigo(error, "P2002");
export const estaEnUso = (error: unknown) => tieneCodigo(error, "P2003");
export const noExiste = (error: unknown) => tieneCodigo(error, "P2025");

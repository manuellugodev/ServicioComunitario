import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type Entrada = {
  usuarioId: number;
  accion: "CREAR" | "EDITAR" | "ELIMINAR";
  tabla: string;
  registroId: number;
  detalle?: Prisma.InputJsonValue;
};

export function registrarBitacora(tx: Prisma.TransactionClient, entrada: Entrada) {
  return tx.bitacora.create({ data: entrada });
}

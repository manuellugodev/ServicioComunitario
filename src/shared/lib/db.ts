import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalConPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalConPrisma.prisma ?? crearCliente();

// En desarrollo la recarga en caliente crearía una conexión nueva en cada cambio.
if (process.env.NODE_ENV !== "production") {
  globalConPrisma.prisma = db;
}

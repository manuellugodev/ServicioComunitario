import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const contrasena = process.env.ADMIN_PASSWORD;
  if (!contrasena) {
    throw new Error("Define ADMIN_PASSWORD en el archivo .env.");
  }

  if ((await db.usuario.count({ where: { rol: "ADMIN" } })) > 0) {
    console.log("Ya existe un administrador; no se creó otro.");
    return;
  }

  await db.usuario.create({
    data: {
      nombreCompleto: "Administrador",
      cedula: "V00000000",
      usuario: "admin",
      passwordHash: await bcrypt.hash(contrasena, 12),
      rol: "ADMIN",
    },
  });
  console.log("Administrador creado con el usuario: admin");
}

main().finally(() => db.$disconnect());

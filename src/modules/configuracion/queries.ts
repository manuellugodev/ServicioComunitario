import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { ID_CONFIGURACION } from "@/modules/configuracion/schemas";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

// Sin requerirSesion porque el nombre también se muestra en la pantalla de inicio de sesión.
export const obtenerNombreConsejo = cache(async () => {
  await connection();
  const { nombreConsejo } = await db.configuracion.findUniqueOrThrow({
    where: { id: ID_CONFIGURACION },
  });
  return nombreConsejo;
});

export async function listarSectores() {
  await requerirSesion();
  return db.sector.findMany({ orderBy: { nombre: "asc" } });
}

export async function listarCategoriasTalento() {
  await requerirSesion();
  return db.categoriaTalento.findMany({ orderBy: { nombre: "asc" } });
}

export async function listarTiposVivienda() {
  await requerirSesion();
  return db.tipoVivienda.findMany({ orderBy: { nombre: "asc" } });
}

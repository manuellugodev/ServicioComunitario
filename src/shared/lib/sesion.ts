import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import { COOKIE_SESION } from "@/shared/lib/cookie-sesion";
import { db } from "@/shared/lib/db";
import type { Rol } from "@/shared/lib/roles";

type DatosSesion = { usuarioId?: number };

const OCHO_HORAS = 60 * 60 * 8;

const opciones: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: COOKIE_SESION,
  ttl: OCHO_HORAS,
  cookieOptions: { secure: process.env.COOKIE_SEGURA !== "false" },
};

async function leerSesion() {
  // iron-session usa Date.now() al descifrar, que no se permite al preparar un enlace.
  await connection();
  return getIronSession<DatosSesion>(await cookies(), opciones);
}

export async function abrirSesion(usuarioId: number) {
  const sesion = await leerSesion();
  sesion.usuarioId = usuarioId;
  await sesion.save();
}

export async function destruirSesion() {
  const sesion = await leerSesion();
  sesion.destroy();
}

// Consulta la base de datos para que un usuario desactivado pierda el acceso de inmediato.
export const requerirSesion = cache(async () => {
  const { usuarioId } = await leerSesion();
  if (!usuarioId) {
    redirect("/login");
  }

  const usuario = await db.usuario.findFirst({
    where: { id: usuarioId, activo: true },
    select: { id: true, nombreCompleto: true, usuario: true, rol: true },
  });
  if (!usuario) {
    redirect("/login");
  }

  return usuario;
});

async function requerirRol(...roles: Rol[]) {
  const usuario = await requerirSesion();
  if (!roles.includes(usuario.rol)) {
    redirect("/");
  }
  return usuario;
}

export const requerirAdmin = () => requerirRol("ADMIN");
export const requerirEscritura = () => requerirRol("ADMIN", "VOCERO");

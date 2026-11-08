import "server-only";
import { db } from "@/shared/lib/db";
import { requerirSesion } from "@/shared/lib/sesion";

const CAMPOS_PUBLICOS = {
  id: true,
  nombreCompleto: true,
  cedula: true,
  usuario: true,
  rol: true,
  activo: true,
} as const;

export async function listarUsuarios() {
  await requerirSesion();
  return db.usuario.findMany({ select: CAMPOS_PUBLICOS, orderBy: { nombreCompleto: "asc" } });
}

// incluirId conserva en la lista a un responsable que luego fue desactivado.
export async function listarUsuariosActivos(incluirId?: number) {
  await requerirSesion();
  return db.usuario.findMany({
    where: { OR: [{ activo: true }, { id: incluirId }] },
    select: { id: true, nombreCompleto: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function obtenerUsuario(id: number) {
  await requerirSesion();
  return db.usuario.findUnique({ where: { id }, select: CAMPOS_PUBLICOS });
}

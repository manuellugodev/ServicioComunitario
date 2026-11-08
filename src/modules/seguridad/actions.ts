"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  esquemaCambiarContrasena,
  esquemaCrearUsuario,
  esquemaEditarUsuario,
  esquemaInicioSesion,
  esquemaRestablecerContrasena,
} from "@/modules/seguridad/schemas";
import { aErrores, esDuplicado, sinContrasenas } from "@/shared/lib/acciones";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import type { EstadoFormulario } from "@/shared/lib/formularios";
import { abrirSesion, destruirSesion, requerirSesion } from "@/shared/lib/sesion";

const COSTO_BCRYPT = 12;
const TABLA = "usuario";

// Comparar contra este hash iguala el tiempo de respuesta cuando el usuario no existe.
const HASH_FICTICIO = bcrypt.hashSync("usuario-inexistente", COSTO_BCRYPT);

const ERROR_DUPLICADO = "Ya existe un usuario con esa cédula o ese nombre de usuario.";
const ERROR_NO_ENCONTRADO = "El usuario ya no existe.";
const ERROR_ULTIMO_ADMIN = "Debe quedar al menos un administrador activo.";

async function esUltimoAdmin(id: number) {
  const otros = await db.usuario.count({
    where: { rol: "ADMIN", activo: true, id: { not: id } },
  });
  return otros === 0;
}

export async function iniciarSesion(
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = esquemaInicioSesion.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const usuario = await db.usuario.findUnique({ where: { usuario: datos.data.usuario } });
  const correcta = await bcrypt.compare(
    datos.data.contrasena,
    usuario?.passwordHash ?? HASH_FICTICIO
  );

  if (!usuario || !usuario.activo || !correcta) {
    return { error: "Usuario o contraseña incorrectos.", valores: sinContrasenas(formData) };
  }

  await abrirSesion(usuario.id);
  redirect("/");
}

export async function cerrarSesion() {
  await destruirSesion();
  redirect("/login");
}

export async function crearUsuario(
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaCrearUsuario.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const { contrasena, ...campos } = datos.data;
  const passwordHash = await bcrypt.hash(contrasena, COSTO_BCRYPT);

  try {
    await db.$transaction(async (tx) => {
      const creado = await tx.usuario.create({ data: { ...campos, passwordHash } });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA,
        registroId: creado.id,
        detalle: campos,
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: ERROR_DUPLICADO, valores: sinContrasenas(formData) };
    }
    throw error;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function editarUsuario(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaEditarUsuario.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const actual = await db.usuario.findUnique({ where: { id } });
  if (!actual) {
    return { error: ERROR_NO_ENCONTRADO };
  }

  const pierdeAdmin = actual.rol === "ADMIN" && actual.activo && datos.data.rol !== "ADMIN";
  if (pierdeAdmin && (await esUltimoAdmin(id))) {
    return { error: ERROR_ULTIMO_ADMIN, valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id }, data: datos.data });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA,
        registroId: id,
        detalle: {
          antes: {
            nombreCompleto: actual.nombreCompleto,
            cedula: actual.cedula,
            usuario: actual.usuario,
            rol: actual.rol,
          },
          despues: datos.data,
        },
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: ERROR_DUPLICADO, valores: sinContrasenas(formData) };
    }
    throw error;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function cambiarEstadoUsuario(
  id: number,
  activo: boolean
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const actual = await db.usuario.findUnique({ where: { id } });
  if (!actual) {
    return { error: ERROR_NO_ENCONTRADO };
  }

  if (!activo && actual.rol === "ADMIN" && actual.activo && (await esUltimoAdmin(id))) {
    return { error: ERROR_ULTIMO_ADMIN };
  }

  await db.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id }, data: { activo } });
    await registrarBitacora(tx, {
      usuarioId: sesion.id,
      accion: "EDITAR",
      tabla: TABLA,
      registroId: id,
      detalle: { activo },
    });
  });

  revalidatePath("/usuarios");
  return {};
}

async function guardarContrasena(id: number, usuarioSesion: number, contrasena: string) {
  const passwordHash = await bcrypt.hash(contrasena, COSTO_BCRYPT);
  await db.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id }, data: { passwordHash } });
    await registrarBitacora(tx, {
      usuarioId: usuarioSesion,
      accion: "EDITAR",
      tabla: TABLA,
      registroId: id,
      detalle: { campo: "contrasena" },
    });
  });
}

export async function restablecerContrasena(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaRestablecerContrasena.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error) };
  }

  if (!(await db.usuario.count({ where: { id } }))) {
    return { error: ERROR_NO_ENCONTRADO };
  }

  await guardarContrasena(id, sesion.id, datos.data.contrasena);
  return { exito: "Contraseña restablecida." };
}

export async function cambiarMiContrasena(
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaCambiarContrasena.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error) };
  }

  const { passwordHash } = await db.usuario.findUniqueOrThrow({
    where: { id: sesion.id },
    select: { passwordHash: true },
  });
  if (!(await bcrypt.compare(datos.data.actual, passwordHash))) {
    return { errores: { actual: ["La contraseña actual no es correcta."] } };
  }

  await guardarContrasena(sesion.id, sesion.id, datos.data.nueva);
  return { exito: "Tu contraseña fue actualizada." };
}

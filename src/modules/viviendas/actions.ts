"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { esquemaVivienda } from "@/modules/viviendas/schemas";
import { aErrores, noExiste, sinContrasenas, violaReferencia } from "@/shared/lib/acciones";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import type { EstadoFormulario } from "@/shared/lib/formularios";
import { requerirSesion } from "@/shared/lib/sesion";

const TABLA = "vivienda";
const RUTA = "/viviendas";
const PREFIJO_CODIGO = "ABN";
const ERROR_REFERENCIA = "El sector o el tipo de vivienda seleccionado ya no existe.";
const ERROR_NO_ENCONTRADA = "La vivienda ya no existe.";

const CAMPOS_EDITABLES = {
  sectorId: true,
  tipoViviendaId: true,
  direccion: true,
  tenencia: true,
  agua: true,
  electricidad: true,
  gas: true,
  aseo: true,
  internet: true,
  observaciones: true,
} as const;

function generarCodigo(id: number) {
  return `${PREFIJO_CODIGO}-${String(id).padStart(3, "0")}`;
}

export async function crearVivienda(
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaVivienda.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  let id: number;
  try {
    id = await db.$transaction(async (tx) => {
      // El código sale del id, así que el id se reserva antes de insertar.
      const [reservado] = await tx.$queryRaw<{ id: number }[]>`
        SELECT nextval(pg_get_serial_sequence('vivienda', 'id'))::int AS id
      `;
      const codigo = generarCodigo(reservado.id);
      await tx.vivienda.create({
        data: { ...datos.data, id: reservado.id, codigo, creadoPorId: sesion.id },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA,
        registroId: reservado.id,
        detalle: { codigo, ...datos.data },
      });
      return reservado.id;
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: ERROR_REFERENCIA, valores: sinContrasenas(formData) };
    }
    throw error;
  }

  revalidatePath(RUTA);
  redirect(`${RUTA}/${id}`);
}

export async function editarVivienda(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaVivienda.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const actual = await db.vivienda.findUnique({ where: { id }, select: CAMPOS_EDITABLES });
  if (!actual) {
    return { error: ERROR_NO_ENCONTRADA };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.vivienda.update({ where: { id }, data: datos.data });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA,
        registroId: id,
        detalle: { antes: actual, despues: datos.data },
      });
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: ERROR_REFERENCIA, valores: sinContrasenas(formData) };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADA };
    }
    throw error;
  }

  revalidatePath(RUTA);
  redirect(`${RUTA}/${id}`);
}

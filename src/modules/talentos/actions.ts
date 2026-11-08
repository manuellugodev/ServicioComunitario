"use server";

import { revalidatePath } from "next/cache";
import {
  esquemaAsignacion,
  esquemaDatosAsignacion,
  esquemaTalentoCatalogo,
} from "@/modules/talentos/schemas";
import {
  aErrores,
  esDuplicado,
  noExiste,
  sinContrasenas,
  violaReferencia,
} from "@/shared/lib/acciones";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import type { EstadoFormulario } from "@/shared/lib/formularios";
import { requerirSesion } from "@/shared/lib/sesion";

const TABLA_CATALOGO = "talento";
const TABLA_ASIGNACION = "habitante_talento";
const ERROR_NO_ENCONTRADO = "Ese registro ya no existe.";

export async function guardarTalentoCatalogo(
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaTalentoCatalogo.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      const talento =
        id === null
          ? await tx.talento.create({ data: datos.data })
          : await tx.talento.update({ where: { id }, data: datos.data });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: id === null ? "CREAR" : "EDITAR",
        tabla: TABLA_CATALOGO,
        registroId: talento.id,
        detalle: datos.data,
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: "Ya existe un talento con ese nombre.", valores: sinContrasenas(formData) };
    }
    if (violaReferencia(error)) {
      return { error: "La categoría seleccionada ya no existe.", valores: sinContrasenas(formData) };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return {};
}

export async function eliminarTalentoCatalogo(id: number): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  try {
    await db.$transaction(async (tx) => {
      const eliminado = await tx.talento.delete({ where: { id } });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "ELIMINAR",
        tabla: TABLA_CATALOGO,
        registroId: id,
        detalle: { nombre: eliminado.nombre },
      });
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: "No se puede eliminar porque hay vecinos o proyectos que lo usan." };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return {};
}

export async function asignarTalento(
  habitanteId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaAsignacion.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.habitanteTalento.create({ data: { ...datos.data, habitanteId } });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA_ASIGNACION,
        registroId: habitanteId,
        detalle: datos.data,
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: "Esta persona ya tiene ese talento.", valores: sinContrasenas(formData) };
    }
    if (violaReferencia(error)) {
      return { error: "La persona o el talento ya no existe.", valores: sinContrasenas(formData) };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { exito: "Talento agregado." };
}

export async function editarAsignacion(
  habitanteId: number,
  talentoId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaDatosAsignacion.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.habitanteTalento.update({
        where: { habitanteId_talentoId: { habitanteId, talentoId } },
        data: datos.data,
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA_ASIGNACION,
        registroId: habitanteId,
        detalle: { talentoId, ...datos.data },
      });
    });
  } catch (error) {
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return {};
}

export async function quitarTalento(
  habitanteId: number,
  talentoId: number
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  try {
    await db.$transaction(async (tx) => {
      await tx.habitanteTalento.delete({
        where: { habitanteId_talentoId: { habitanteId, talentoId } },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "ELIMINAR",
        tabla: TABLA_ASIGNACION,
        registroId: habitanteId,
        detalle: { talentoId },
      });
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: "No se puede quitar porque está asignado a un proyecto con este talento." };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return {};
}

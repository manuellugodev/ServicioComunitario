"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { esquemaFamilia } from "@/modules/familias/schemas";
import { aErrores, noExiste, sinContrasenas, violaReferencia } from "@/shared/lib/acciones";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import type { EstadoFormulario } from "@/shared/lib/formularios";
import { requerirSesion } from "@/shared/lib/sesion";

const TABLA = "nucleo_familiar";
const ERROR_VIVIENDA = "La vivienda ya no existe.";
const ERROR_NO_ENCONTRADA = "La familia ya no existe.";

export async function crearFamilia(
  viviendaId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaFamilia.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  let id: number;
  try {
    id = await db.$transaction(async (tx) => {
      const familia = await tx.nucleoFamiliar.create({
        data: { ...datos.data, viviendaId, creadoPorId: sesion.id },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA,
        registroId: familia.id,
        detalle: { viviendaId, ...datos.data },
      });
      return familia.id;
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: ERROR_VIVIENDA, valores: sinContrasenas(formData) };
    }
    throw error;
  }

  revalidatePath(`/viviendas/${viviendaId}`);
  redirect(`/familias/${id}`);
}

export async function editarFamilia(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaFamilia.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const actual = await db.nucleoFamiliar.findUnique({ where: { id } });
  if (!actual) {
    return { error: ERROR_NO_ENCONTRADA };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.nucleoFamiliar.update({ where: { id }, data: datos.data });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA,
        registroId: id,
        detalle: {
          antes: {
            ingresoAproxUsd: actual.ingresoAproxUsd?.toString() ?? null,
            recibeClap: actual.recibeClap,
            observaciones: actual.observaciones,
          },
          despues: datos.data,
        },
      });
    });
  } catch (error) {
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADA };
    }
    throw error;
  }

  revalidatePath(`/viviendas/${actual.viviendaId}`);
  revalidatePath(`/familias/${id}`);
  redirect(`/familias/${id}`);
}

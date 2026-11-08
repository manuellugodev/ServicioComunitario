"use server";

import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { esquemaEstado, esquemaHabitante } from "@/modules/habitantes/schemas";
import {
  aErrores,
  esDuplicado,
  noExiste,
  sinContrasenas,
  violaReferencia,
} from "@/shared/lib/acciones";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import { aTextoFecha } from "@/shared/lib/fechas";
import type { EstadoFormulario } from "@/shared/lib/formularios";
import { requerirSesion } from "@/shared/lib/sesion";

const TABLA = "habitante";
const ERROR_CEDULA = "Ya hay una persona registrada con esa cédula.";
const ERROR_JEFE = "Esta familia ya tiene un jefe(a) activo.";
const ERROR_DUPLICADO = "Ya hay una persona con esa cédula o la familia ya tiene un jefe(a) activo.";
const ERROR_NO_ENCONTRADO = "La persona ya no existe.";

type DatosHabitante = z.output<typeof esquemaHabitante>;

// Los datos de salud no se copian a la bitácora para no replicar información sensible.
function paraBitacora(datos: Omit<DatosHabitante, "nacionalidad"> & { nacionalidad: string }) {
  const { discapacidad, enfermedadCronica, fechaNacimiento, ...resto } = datos;
  return {
    ...resto,
    fechaNacimiento: aTextoFecha(fechaNacimiento),
    saludRegistrada: Boolean(discapacidad || enfermedadCronica),
  };
}

async function erroresDeUnicidad(
  datos: DatosHabitante,
  nucleoId: number,
  excluirId?: number,
  cuentaComoJefe = true
) {
  const errores: Record<string, string[]> = {};

  if (datos.cedula) {
    const repetida = await db.habitante.count({
      where: {
        nacionalidad: datos.nacionalidad,
        cedula: datos.cedula,
        id: excluirId ? { not: excluirId } : undefined,
      },
    });
    if (repetida > 0) {
      errores.cedula = [ERROR_CEDULA];
    }
  }

  if (datos.parentesco === "JEFE" && cuentaComoJefe) {
    const otros = await db.habitante.count({
      where: {
        nucleoId,
        parentesco: "JEFE",
        estado: "ACTIVO",
        id: excluirId ? { not: excluirId } : undefined,
      },
    });
    if (otros > 0) {
      errores.parentesco = [ERROR_JEFE];
    }
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

export async function crearHabitante(
  nucleoId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaHabitante.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const errores = await erroresDeUnicidad(datos.data, nucleoId);
  if (errores) {
    return { errores, valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      const habitante = await tx.habitante.create({
        data: { ...datos.data, nucleoId, creadoPorId: sesion.id },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA,
        registroId: habitante.id,
        detalle: { nucleoId, ...paraBitacora(datos.data) },
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: ERROR_DUPLICADO, valores: sinContrasenas(formData) };
    }
    if (violaReferencia(error)) {
      return { error: "La familia ya no existe.", valores: sinContrasenas(formData) };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect(`/familias/${nucleoId}`);
}

export async function editarHabitante(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaHabitante.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const actual = await db.habitante.findUnique({ where: { id } });
  if (!actual) {
    return { error: ERROR_NO_ENCONTRADO };
  }

  const errores = await erroresDeUnicidad(datos.data, actual.nucleoId, id, actual.estado === "ACTIVO");
  if (errores) {
    return { errores, valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.habitante.update({ where: { id }, data: datos.data });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA,
        registroId: id,
        detalle: {
          antes: paraBitacora({
            nombres: actual.nombres,
            apellidos: actual.apellidos,
            nacionalidad: actual.nacionalidad,
            cedula: actual.cedula,
            fechaNacimiento: actual.fechaNacimiento,
            sexo: actual.sexo,
            parentesco: actual.parentesco,
            telefono: actual.telefono,
            correo: actual.correo,
            nivelEducativo: actual.nivelEducativo,
            estudiaActualmente: actual.estudiaActualmente,
            ocupacion: actual.ocupacion,
            discapacidad: actual.discapacidad,
            enfermedadCronica: actual.enfermedadCronica,
          }),
          despues: paraBitacora(datos.data),
        },
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: ERROR_DUPLICADO, valores: sinContrasenas(formData) };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect(`/habitantes/${id}`);
}

export async function cambiarEstadoHabitante(
  id: number,
  estado: z.output<typeof esquemaEstado>
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();
  const nuevoEstado = esquemaEstado.parse(estado);

  try {
    await db.$transaction(async (tx) => {
      await tx.habitante.update({ where: { id }, data: { estado: nuevoEstado } });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA,
        registroId: id,
        detalle: { estado: nuevoEstado },
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: "No se puede reactivar: la familia ya tiene otro jefe(a) activo." };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return {};
}

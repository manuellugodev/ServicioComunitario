"use server";

import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  esquemaCantidad,
  esquemaParticipante,
  esquemaProyecto,
  esquemaRequerimiento,
} from "@/modules/proyectos/schemas";
import {
  aErrores,
  esDuplicado,
  noExiste,
  sinContrasenas,
  violaReferencia,
} from "@/shared/lib/acciones";
import { registrarBitacora } from "@/shared/lib/bitacora";
import { db } from "@/shared/lib/db";
import { aTextoFecha, hoyEnCaracas } from "@/shared/lib/fechas";
import type { EstadoFormulario } from "@/shared/lib/formularios";
import { requerirSesion } from "@/shared/lib/sesion";

const TABLA_PROYECTO = "proyecto";
const TABLA_REQUERIMIENTO = "proyecto_talento";
const TABLA_PARTICIPANTE = "proyecto_participante";
const ERROR_NO_ENCONTRADO = "Ese registro ya no existe.";
const ERROR_RESPONSABLE = "El responsable seleccionado ya no existe.";

type DatosProyecto = z.output<typeof esquemaProyecto>;

function paraBitacora(datos: DatosProyecto) {
  return {
    ...datos,
    fechaInicio: datos.fechaInicio && aTextoFecha(datos.fechaInicio),
    fechaFin: datos.fechaFin && aTextoFecha(datos.fechaFin),
  };
}

function refrescar() {
  revalidatePath("/", "layout");
}

export async function crearProyecto(
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaProyecto.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  let id: number;
  try {
    id = await db.$transaction(async (tx) => {
      const proyecto = await tx.proyecto.create({
        data: { ...datos.data, creadoPorId: sesion.id },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA_PROYECTO,
        registroId: proyecto.id,
        detalle: paraBitacora(datos.data),
      });
      return proyecto.id;
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: ERROR_RESPONSABLE, valores: sinContrasenas(formData) };
    }
    throw error;
  }

  refrescar();
  redirect(`/proyectos/${id}`);
}

export async function editarProyecto(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaProyecto.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.proyecto.update({ where: { id }, data: datos.data });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA_PROYECTO,
        registroId: id,
        detalle: paraBitacora(datos.data),
      });
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: ERROR_RESPONSABLE, valores: sinContrasenas(formData) };
    }
    if (noExiste(error)) {
      return { error: "El proyecto ya no existe." };
    }
    throw error;
  }

  refrescar();
  redirect(`/proyectos/${id}`);
}

export async function agregarRequerimiento(
  proyectoId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaRequerimiento.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.proyectoTalento.create({ data: { ...datos.data, proyectoId } });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA_REQUERIMIENTO,
        registroId: proyectoId,
        detalle: datos.data,
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: "Este proyecto ya requiere ese talento.", valores: sinContrasenas(formData) };
    }
    if (violaReferencia(error)) {
      return { error: "El proyecto o el talento ya no existe.", valores: sinContrasenas(formData) };
    }
    throw error;
  }

  refrescar();
  return {};
}

export async function actualizarCantidad(
  proyectoId: number,
  talentoId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaCantidad.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const asignados = await db.proyectoParticipante.count({ where: { proyectoId, talentoId } });
  if (datos.data.cantidadRequerida < asignados) {
    return {
      errores: { cantidadRequerida: [`Ya hay ${asignados} vecinos asignados con este talento.`] },
      valores: sinContrasenas(formData),
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.proyectoTalento.update({
        where: { proyectoId_talentoId: { proyectoId, talentoId } },
        data: datos.data,
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "EDITAR",
        tabla: TABLA_REQUERIMIENTO,
        registroId: proyectoId,
        detalle: { talentoId, ...datos.data },
      });
    });
  } catch (error) {
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  refrescar();
  return { exito: "Cantidad actualizada." };
}

export async function quitarRequerimiento(
  proyectoId: number,
  talentoId: number
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  try {
    await db.$transaction(async (tx) => {
      await tx.proyectoTalento.delete({
        where: { proyectoId_talentoId: { proyectoId, talentoId } },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "ELIMINAR",
        tabla: TABLA_REQUERIMIENTO,
        registroId: proyectoId,
        detalle: { talentoId },
      });
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: "Primero quita a los vecinos asignados con este talento." };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  refrescar();
  return {};
}

export async function asignarVecino(
  proyectoId: number,
  habitanteId: number,
  talentoId: number,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaParticipante.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const [requerimiento, activo] = await Promise.all([
    db.proyectoTalento.findUnique({
      where: { proyectoId_talentoId: { proyectoId, talentoId } },
      select: { cantidadRequerida: true, _count: { select: { participantes: true } } },
    }),
    db.habitante.count({ where: { id: habitanteId, estado: "ACTIVO" } }),
  ]);

  if (!requerimiento) {
    return { error: "Este proyecto ya no requiere ese talento." };
  }
  if (requerimiento._count.participantes >= requerimiento.cantidadRequerida) {
    return { error: "Ya se cubrió la cantidad requerida para este talento." };
  }
  if (!activo) {
    return { error: "Esta persona ya no está activa." };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.proyectoParticipante.create({
        data: {
          proyectoId,
          habitanteId,
          talentoId,
          rol: datos.data.rol,
          fechaAsignacion: new Date(`${hoyEnCaracas()}T00:00:00.000Z`),
        },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "CREAR",
        tabla: TABLA_PARTICIPANTE,
        registroId: proyectoId,
        detalle: { habitanteId, talentoId, rol: datos.data.rol },
      });
    });
  } catch (error) {
    if (esDuplicado(error)) {
      return { error: "Esta persona ya está asignada con ese talento." };
    }
    if (violaReferencia(error)) {
      return { error: "Esta persona no tiene ese talento." };
    }
    throw error;
  }

  refrescar();
  return {};
}

export async function quitarParticipante(
  proyectoId: number,
  habitanteId: number,
  talentoId: number
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  try {
    await db.$transaction(async (tx) => {
      await tx.proyectoParticipante.delete({
        where: { proyectoId_habitanteId_talentoId: { proyectoId, habitanteId, talentoId } },
      });
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "ELIMINAR",
        tabla: TABLA_PARTICIPANTE,
        registroId: proyectoId,
        detalle: { habitanteId, talentoId },
      });
    });
  } catch (error) {
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  refrescar();
  return {};
}

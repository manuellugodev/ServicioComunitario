"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import {
  ID_CONFIGURACION,
  esquemaCatalogo,
  esquemaElementoCatalogo,
  esquemaNombreConsejo,
  type Catalogo,
} from "@/modules/configuracion/schemas";
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

const RUTA = "/configuracion";
const ERROR_DUPLICADO = "Ya existe un registro con ese nombre.";
const ERROR_NO_ENCONTRADO = "Ese registro ya no existe.";
const ERROR_EN_USO = "No se puede eliminar porque hay registros que lo usan.";

type Tx = Prisma.TransactionClient;
type Elemento = { id: number; nombre: string };
type Operaciones = {
  crear: (tx: Tx, nombre: string) => Promise<Elemento>;
  editar: (tx: Tx, id: number, nombre: string) => Promise<Elemento>;
  eliminar: (tx: Tx, id: number) => Promise<Elemento>;
};

const OPERACIONES: Record<Catalogo, Operaciones> = {
  sector: {
    crear: (tx, nombre) => tx.sector.create({ data: { nombre } }),
    editar: (tx, id, nombre) => tx.sector.update({ where: { id }, data: { nombre } }),
    eliminar: (tx, id) => tx.sector.delete({ where: { id } }),
  },
  tipo_vivienda: {
    crear: (tx, nombre) => tx.tipoVivienda.create({ data: { nombre } }),
    editar: (tx, id, nombre) => tx.tipoVivienda.update({ where: { id }, data: { nombre } }),
    eliminar: (tx, id) => tx.tipoVivienda.delete({ where: { id } }),
  },
  categoria_talento: {
    crear: (tx, nombre) => tx.categoriaTalento.create({ data: { nombre } }),
    editar: (tx, id, nombre) => tx.categoriaTalento.update({ where: { id }, data: { nombre } }),
    eliminar: (tx, id) => tx.categoriaTalento.delete({ where: { id } }),
  },
};

export async function guardarElemento(
  catalogo: Catalogo,
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();
  const operaciones = OPERACIONES[esquemaCatalogo.parse(catalogo)];

  const datos = esquemaElementoCatalogo.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  const { nombre } = datos.data;

  try {
    await db.$transaction(async (tx) => {
      const elemento =
        id === null ? await operaciones.crear(tx, nombre) : await operaciones.editar(tx, id, nombre);
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: id === null ? "CREAR" : "EDITAR",
        tabla: catalogo,
        registroId: elemento.id,
        detalle: { nombre },
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

  revalidatePath(RUTA);
  return {};
}

export async function eliminarElemento(
  catalogo: Catalogo,
  id: number
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();
  const operaciones = OPERACIONES[esquemaCatalogo.parse(catalogo)];

  try {
    await db.$transaction(async (tx) => {
      const eliminado = await operaciones.eliminar(tx, id);
      await registrarBitacora(tx, {
        usuarioId: sesion.id,
        accion: "ELIMINAR",
        tabla: catalogo,
        registroId: id,
        detalle: { nombre: eliminado.nombre },
      });
    });
  } catch (error) {
    if (violaReferencia(error)) {
      return { error: ERROR_EN_USO };
    }
    if (noExiste(error)) {
      return { error: ERROR_NO_ENCONTRADO };
    }
    throw error;
  }

  revalidatePath(RUTA);
  return {};
}

export async function actualizarNombreConsejo(
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const sesion = await requerirSesion();

  const datos = esquemaNombreConsejo.safeParse(Object.fromEntries(formData));
  if (!datos.success) {
    return { errores: aErrores(datos.error), valores: sinContrasenas(formData) };
  }

  await db.$transaction(async (tx) => {
    await tx.configuracion.update({ where: { id: ID_CONFIGURACION }, data: datos.data });
    await registrarBitacora(tx, {
      usuarioId: sesion.id,
      accion: "EDITAR",
      tabla: "configuracion",
      registroId: ID_CONFIGURACION,
      detalle: datos.data,
    });
  });

  revalidatePath("/", "layout");
  return { exito: "Nombre actualizado." };
}

"use client";

import { cambiarEstadoHabitante } from "@/modules/habitantes/actions";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";

type Props = {
  id: number;
  nombre: string;
  estado: "ACTIVO" | "MUDADO" | "FALLECIDO";
};

export function BotonesEstadoHabitante({ id, nombre, estado }: Props) {
  if (estado !== "ACTIVO") {
    return (
      <BotonConfirmar
        etiqueta="Reactivar"
        titulo={`¿Reactivar a ${nombre}?`}
        descripcion="Volverá a contarse como habitante activo."
        confirmar="Reactivar"
        variante="outline"
        accion={() => cambiarEstadoHabitante(id, "ACTIVO")}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      <BotonConfirmar
        etiqueta="Marcar como mudado"
        titulo={`¿Marcar a ${nombre} como mudado?`}
        descripcion="Dejará de contarse como habitante activo, pero su historial se conserva."
        confirmar="Marcar como mudado"
        variante="outline"
        accion={() => cambiarEstadoHabitante(id, "MUDADO")}
      />
      <BotonConfirmar
        etiqueta="Marcar como fallecido"
        titulo={`¿Marcar a ${nombre} como fallecido?`}
        descripcion="Dejará de contarse como habitante activo, pero su historial se conserva."
        confirmar="Marcar como fallecido"
        accion={() => cambiarEstadoHabitante(id, "FALLECIDO")}
      />
    </div>
  );
}

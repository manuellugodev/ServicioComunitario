"use client";

import Link from "next/link";
import { quitarParticipante } from "@/modules/proyectos/actions";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";

export type Participante = {
  habitanteId: number;
  talentoId: number;
  nombre: string;
  talento: string;
  rol: string | null;
  fecha: string;
  telefono: string | null;
  activo: boolean;
};

export function ParticipantesProyecto({
  proyectoId,
  participantes,
}: {
  proyectoId: number;
  participantes: Participante[];
}) {
  return (
    <section className="grid max-w-2xl gap-4">
      <h2 className="font-heading text-lg font-semibold">Vecinos asignados</h2>
      {participantes.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay vecinos asignados.</p>
      ) : (
        <ul>
          {participantes.map((participante) => (
            <li
              key={`${participante.habitanteId}-${participante.talentoId}`}
              className="flex flex-wrap items-start justify-between gap-2 border-b py-2"
            >
              <div>
                <Link href={`/habitantes/${participante.habitanteId}`} className="font-medium underline">
                  {participante.nombre}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {participante.talento}
                  {participante.rol && ` · ${participante.rol}`} · Desde {participante.fecha}
                  {participante.telefono && ` · ${participante.telefono}`}
                  {!participante.activo && " · Ya no está activo(a)"}
                </p>
              </div>
              <BotonConfirmar
                etiqueta="Quitar"
                titulo={`¿Quitar a ${participante.nombre} del proyecto?`}
                descripcion="Dejará de estar asignado con este talento."
                confirmar="Quitar"
                tamano="sm"
                accion={() =>
                  quitarParticipante(proyectoId, participante.habitanteId, participante.talentoId)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

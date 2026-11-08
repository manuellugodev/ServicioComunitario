"use client";

import { useActionState } from "react";
import Link from "next/link";
import { asignarVecino } from "@/modules/proyectos/actions";
import { ETIQUETAS_NIVEL_TALENTO, type Nivel } from "@/modules/talentos/schemas";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";

type Sugerido = {
  habitanteId: number;
  nombre: string;
  nivel: Nivel;
  aniosExperiencia: number;
  certificado: boolean;
  telefono: string | null;
  sector: string;
};

export type GrupoSugeridos = {
  talentoId: number;
  nombre: string;
  completo: boolean;
  sugeridos: Sugerido[];
};

function FilaSugerido({
  proyectoId,
  talentoId,
  sugerido,
}: {
  proyectoId: number;
  talentoId: number;
  sugerido: Sugerido;
}) {
  const [estado, accion, pendiente] = useActionState(
    asignarVecino.bind(null, proyectoId, sugerido.habitanteId, talentoId),
    {}
  );

  return (
    <li className="grid gap-2 border-b py-3">
      <div>
        <Link href={`/habitantes/${sugerido.habitanteId}`} className="font-medium underline">
          {sugerido.nombre}
        </Link>
        <p className="text-sm text-muted-foreground">
          {ETIQUETAS_NIVEL_TALENTO[sugerido.nivel]} · {sugerido.aniosExperiencia} años
          {sugerido.certificado && " · Certificado"} · {sugerido.sector}
          {sugerido.telefono && ` · ${sugerido.telefono}`}
        </p>
      </div>
      <form action={accion} className="grid max-w-xs gap-2">
        <Campo
          id={`rol-${talentoId}-${sugerido.habitanteId}`}
          name="rol"
          etiqueta="Rol en el proyecto (opcional)"
          defaultValue={estado.valores?.rol}
          errores={estado.errores?.rol}
        />
        <AvisoFormulario estado={estado} />
        <Button type="submit" size="sm" disabled={pendiente} className="w-fit">
          {pendiente ? "Asignando…" : "Asignar"}
        </Button>
      </form>
    </li>
  );
}

export function VecinosSugeridos({
  proyectoId,
  grupos,
}: {
  proyectoId: number;
  grupos: GrupoSugeridos[];
}) {
  if (grupos.length === 0) {
    return null;
  }

  return (
    <section className="grid max-w-2xl gap-6">
      <h2 className="font-heading text-lg font-semibold">Vecinos sugeridos</h2>
      {grupos.map(({ talentoId, nombre, completo, sugeridos }) => (
        <div key={talentoId} className="grid gap-1">
          <h3 className="font-medium">{nombre}</h3>
          {completo ? (
            <p className="text-sm text-muted-foreground">Ya se cubrió la cantidad requerida.</p>
          ) : sugeridos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay vecinos disponibles con este talento.
            </p>
          ) : (
            <ul>
              {sugeridos.map((sugerido) => (
                <FilaSugerido
                  key={sugerido.habitanteId}
                  proyectoId={proyectoId}
                  talentoId={talentoId}
                  sugerido={sugerido}
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

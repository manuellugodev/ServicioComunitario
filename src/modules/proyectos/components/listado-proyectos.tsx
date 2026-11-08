import Link from "next/link";
import { listarProyectos } from "@/modules/proyectos/queries";
import { ESTADOS_PROYECTO, ETIQUETAS_ESTADO_PROYECTO } from "@/modules/proyectos/schemas";
import { aTextoFecha } from "@/shared/lib/fechas";

export async function ListadoProyectos() {
  const proyectos = await listarProyectos();

  if (proyectos.length === 0) {
    return <p className="text-muted-foreground">No hay proyectos registrados.</p>;
  }

  return (
    <div className="grid gap-8">
      {ESTADOS_PROYECTO.map((estado) => {
        const delEstado = proyectos.filter((proyecto) => proyecto.estado === estado);
        if (delEstado.length === 0) {
          return null;
        }

        return (
          <section key={estado} className="grid max-w-3xl gap-2">
            <h2 className="font-heading text-lg font-semibold">
              {ETIQUETAS_ESTADO_PROYECTO[estado]} ({delEstado.length})
            </h2>
            <ul>
              {delEstado.map((proyecto) => {
                const requeridos = proyecto.talentos.reduce(
                  (suma, { cantidadRequerida }) => suma + cantidadRequerida,
                  0
                );
                const asignados = proyecto.talentos.reduce(
                  (suma, { _count }) => suma + _count.participantes,
                  0
                );

                return (
                  <li key={proyecto.id} className="grid gap-0.5 border-b py-2">
                    <Link href={`/proyectos/${proyecto.id}`} className="font-medium underline">
                      {proyecto.nombre}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {proyecto.responsable.nombreCompleto} · {asignados} de {requeridos} vecinos
                      {proyecto.fechaInicio && ` · Inicio: ${aTextoFecha(proyecto.fechaInicio)}`}
                      {proyecto.fechaFin && ` · Fin: ${aTextoFecha(proyecto.fechaFin)}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

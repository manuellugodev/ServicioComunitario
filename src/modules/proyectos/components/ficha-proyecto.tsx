import Link from "next/link";
import { notFound } from "next/navigation";
import { ParticipantesProyecto } from "@/modules/proyectos/components/participantes-proyecto";
import { TalentosRequeridos } from "@/modules/proyectos/components/talentos-requeridos";
import { VecinosSugeridos } from "@/modules/proyectos/components/vecinos-sugeridos";
import { obtenerProyecto, sugerirVecinos } from "@/modules/proyectos/queries";
import { ETIQUETAS_ESTADO_PROYECTO } from "@/modules/proyectos/schemas";
import { listarTalentos } from "@/modules/talentos/queries";
import { Dato } from "@/shared/components/dato";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";
import { aTextoFecha } from "@/shared/lib/fechas";

export async function FichaProyecto({ idTexto }: { idTexto: Promise<string> }) {
  const id = aIdPositivo(await idTexto);
  const proyecto = id ? await obtenerProyecto(id) : null;
  if (!id || !proyecto) {
    notFound();
  }

  const [talentos, grupos] = await Promise.all([
    listarTalentos(),
    Promise.all(
      proyecto.talentos.map(async ({ talentoId, cantidadRequerida, talento, _count }) => {
        const completo = _count.participantes >= cantidadRequerida;
        const sugeridos = completo ? [] : await sugerirVecinos(id, talentoId);
        return {
          talentoId,
          nombre: talento.nombre,
          completo,
          sugeridos: sugeridos.map(({ habitante, ...sugerido }) => ({
            ...sugerido,
            nombre: `${habitante.apellidos}, ${habitante.nombres}`,
            telefono: habitante.telefono,
            sector: habitante.nucleo.vivienda.sector.nombre,
          })),
        };
      })
    ),
  ]);

  const yaRequeridos = new Set(proyecto.talentos.map(({ talentoId }) => talentoId));

  return (
    <div className="grid gap-10">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-semibold">{proyecto.nombre}</h1>
          <Button
            variant="outline"
            size="lg"
            render={<Link href={`/proyectos/${proyecto.id}/editar`} />}
            nativeButton={false}
          >
            Editar
          </Button>
        </div>
        <dl className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Dato etiqueta="Estado">{ETIQUETAS_ESTADO_PROYECTO[proyecto.estado]}</Dato>
          <Dato etiqueta="Responsable">{proyecto.responsable.nombreCompleto}</Dato>
          <Dato etiqueta="Fecha de inicio">
            {proyecto.fechaInicio ? aTextoFecha(proyecto.fechaInicio) : "Sin indicar"}
          </Dato>
          <Dato etiqueta="Fecha de fin">
            {proyecto.fechaFin ? aTextoFecha(proyecto.fechaFin) : "Sin indicar"}
          </Dato>
          <Dato etiqueta="Objetivo y alcance">{proyecto.descripcion ?? "Sin indicar"}</Dato>
        </dl>
      </div>

      <TalentosRequeridos
        proyectoId={id}
        requerimientos={proyecto.talentos.map(({ talentoId, cantidadRequerida, talento, _count }) => ({
          talentoId,
          cantidadRequerida,
          nombre: talento.nombre,
          categoria: talento.categoria.nombre,
          asignados: _count.participantes,
        }))}
        opciones={talentos
          .filter((talento) => !yaRequeridos.has(talento.id))
          .map(({ id: talentoId, nombre, categoria }) => ({
            id: talentoId,
            nombre,
            categoria: categoria.nombre,
          }))}
      />

      <VecinosSugeridos proyectoId={id} grupos={grupos} />

      <ParticipantesProyecto
        proyectoId={id}
        participantes={proyecto.talentos.flatMap(({ talentoId, talento, participantes }) =>
          participantes.map(({ habitanteId, rol, fechaAsignacion, posesion }) => ({
            habitanteId,
            talentoId,
            nombre: `${posesion.habitante.apellidos}, ${posesion.habitante.nombres}`,
            talento: talento.nombre,
            rol,
            fecha: aTextoFecha(fechaAsignacion),
            telefono: posesion.habitante.telefono,
            activo: posesion.habitante.estado === "ACTIVO",
          }))
        )}
      />
    </div>
  );
}

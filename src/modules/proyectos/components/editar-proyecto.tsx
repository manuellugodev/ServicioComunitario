import { notFound } from "next/navigation";
import { editarProyecto } from "@/modules/proyectos/actions";
import { FormularioProyecto } from "@/modules/proyectos/components/formulario-proyecto";
import { obtenerProyecto } from "@/modules/proyectos/queries";
import { listarUsuariosActivos } from "@/modules/seguridad/queries";
import { aIdPositivo } from "@/shared/lib/acciones";
import { aTextoFecha } from "@/shared/lib/fechas";
import { requerirEscritura } from "@/shared/lib/sesion";

export async function EditarProyecto({ idTexto }: { idTexto: Promise<string> }) {
  await requerirEscritura();

  const id = aIdPositivo(await idTexto);
  const proyecto = id ? await obtenerProyecto(id) : null;
  if (!id || !proyecto) {
    notFound();
  }

  const usuarios = await listarUsuariosActivos(proyecto.responsableId);

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Editar proyecto</h1>
      <FormularioProyecto
        accionServidor={editarProyecto.bind(null, id)}
        usuarios={usuarios}
        proyecto={{
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          responsableId: String(proyecto.responsableId),
          fechaInicio: proyecto.fechaInicio && aTextoFecha(proyecto.fechaInicio),
          fechaFin: proyecto.fechaFin && aTextoFecha(proyecto.fechaFin),
          estado: proyecto.estado,
        }}
      />
    </div>
  );
}

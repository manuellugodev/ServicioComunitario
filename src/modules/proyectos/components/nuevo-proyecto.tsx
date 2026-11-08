import { crearProyecto } from "@/modules/proyectos/actions";
import { FormularioProyecto } from "@/modules/proyectos/components/formulario-proyecto";
import { listarUsuariosActivos } from "@/modules/seguridad/queries";
import { requerirEscritura } from "@/shared/lib/sesion";

export async function NuevoProyecto() {
  await requerirEscritura();

  const usuarios = await listarUsuariosActivos();

  return <FormularioProyecto accionServidor={crearProyecto} usuarios={usuarios} />;
}

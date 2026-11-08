import { crearProyecto } from "@/modules/proyectos/actions";
import { FormularioProyecto } from "@/modules/proyectos/components/formulario-proyecto";
import { listarUsuariosActivos } from "@/modules/seguridad/queries";

export async function NuevoProyecto() {
  const usuarios = await listarUsuariosActivos();

  return <FormularioProyecto accionServidor={crearProyecto} usuarios={usuarios} />;
}

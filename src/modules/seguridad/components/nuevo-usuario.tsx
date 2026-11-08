import { crearUsuario } from "@/modules/seguridad/actions";
import { FormularioUsuario } from "@/modules/seguridad/components/formulario-usuario";
import { requerirAdmin } from "@/shared/lib/sesion";

export async function NuevoUsuario() {
  await requerirAdmin();

  return <FormularioUsuario accionServidor={crearUsuario} />;
}

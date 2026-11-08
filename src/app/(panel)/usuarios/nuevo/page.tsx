import { crearUsuario } from "@/modules/seguridad/actions";
import { FormularioUsuario } from "@/modules/seguridad/components/formulario-usuario";

export default function PaginaNuevoUsuario() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Nuevo usuario</h1>
      <FormularioUsuario accionServidor={crearUsuario} />
    </div>
  );
}

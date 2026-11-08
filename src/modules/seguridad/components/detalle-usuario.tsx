import { notFound } from "next/navigation";
import { editarUsuario, restablecerContrasena } from "@/modules/seguridad/actions";
import { BotonEstadoUsuario } from "@/modules/seguridad/components/boton-estado-usuario";
import { FormularioRestablecerContrasena } from "@/modules/seguridad/components/formulario-restablecer-contrasena";
import { FormularioUsuario } from "@/modules/seguridad/components/formulario-usuario";
import { obtenerUsuario } from "@/modules/seguridad/queries";
import { aIdPositivo } from "@/shared/lib/acciones";

export async function DetalleUsuario({ idTexto }: { idTexto: Promise<string> }) {
  const id = aIdPositivo(await idTexto);
  const usuario = id ? await obtenerUsuario(id) : null;
  if (!id || !usuario) {
    notFound();
  }

  return (
    <div className="grid gap-10">
      <FormularioUsuario accionServidor={editarUsuario.bind(null, id)} usuario={usuario} />
      <section className="grid gap-4">
        <h2 className="font-heading text-lg font-semibold">Restablecer contraseña</h2>
        <FormularioRestablecerContrasena accionServidor={restablecerContrasena.bind(null, id)} />
      </section>
      <section className="grid gap-4">
        <h2 className="font-heading text-lg font-semibold">Acceso al sistema</h2>
        <BotonEstadoUsuario id={id} nombre={usuario.nombreCompleto} activo={usuario.activo} />
      </section>
    </div>
  );
}

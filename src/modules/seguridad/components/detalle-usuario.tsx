import { notFound } from "next/navigation";
import { editarUsuario, restablecerContrasena } from "@/modules/seguridad/actions";
import { BotonEstadoUsuario } from "@/modules/seguridad/components/boton-estado-usuario";
import { FormularioRestablecerContrasena } from "@/modules/seguridad/components/formulario-restablecer-contrasena";
import { FormularioUsuario } from "@/modules/seguridad/components/formulario-usuario";
import { obtenerUsuario } from "@/modules/seguridad/queries";

export async function DetalleUsuario({ idTexto }: { idTexto: Promise<string> }) {
  const id = Number(await idTexto);
  const usuario = Number.isSafeInteger(id) && id > 0 ? await obtenerUsuario(id) : null;
  if (!usuario) {
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

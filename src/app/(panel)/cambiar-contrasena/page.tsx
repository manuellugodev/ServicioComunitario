import { FormularioCambiarContrasena } from "@/modules/seguridad/components/formulario-cambiar-contrasena";

export default function PaginaCambiarContrasena() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Cambiar contraseña</h1>
      <FormularioCambiarContrasena />
    </div>
  );
}

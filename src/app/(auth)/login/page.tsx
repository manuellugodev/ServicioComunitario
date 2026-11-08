import { FormularioInicioSesion } from "@/modules/seguridad/components/formulario-inicio-sesion";
import { NOMBRE_CONSEJO } from "@/shared/lib/consejo";

export default function PaginaInicioSesion() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="grid w-full max-w-sm gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-muted-foreground">{NOMBRE_CONSEJO}</p>
        </div>
        <FormularioInicioSesion />
      </div>
    </main>
  );
}

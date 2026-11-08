import { Suspense } from "react";
import { DetalleUsuario } from "@/modules/seguridad/components/detalle-usuario";

export default function PaginaEditarUsuario({ params }: PageProps<"/usuarios/[id]">) {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Editar usuario</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando usuario…</p>}>
        <DetalleUsuario idTexto={params.then(({ id }) => id)} />
      </Suspense>
    </div>
  );
}

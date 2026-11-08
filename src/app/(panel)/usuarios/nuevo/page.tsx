import { Suspense } from "react";
import { NuevoUsuario } from "@/modules/seguridad/components/nuevo-usuario";

export default function PaginaNuevoUsuario() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Nuevo usuario</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando formulario…</p>}>
        <NuevoUsuario />
      </Suspense>
    </div>
  );
}

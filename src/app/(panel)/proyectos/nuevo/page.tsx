import { Suspense } from "react";
import { NuevoProyecto } from "@/modules/proyectos/components/nuevo-proyecto";

export default function PaginaNuevoProyecto() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Nuevo proyecto</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando formulario…</p>}>
        <NuevoProyecto />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { NuevoHabitante } from "@/modules/habitantes/components/nuevo-habitante";

export default function PaginaNuevoMiembro({ params }: PageProps<"/familias/[id]/miembros/nuevo">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando formulario…</p>}>
      <NuevoHabitante idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

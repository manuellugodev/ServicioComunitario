import { Suspense } from "react";
import { EditarHabitante } from "@/modules/habitantes/components/editar-habitante";

export default function PaginaEditarHabitante({ params }: PageProps<"/habitantes/[id]/editar">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando persona…</p>}>
      <EditarHabitante idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

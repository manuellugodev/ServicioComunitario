import { Suspense } from "react";
import { FichaHabitante } from "@/modules/habitantes/components/ficha-habitante";

export default function PaginaFichaHabitante({ params }: PageProps<"/habitantes/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando persona…</p>}>
      <FichaHabitante idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

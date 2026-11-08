import { Suspense } from "react";
import { FichaHabitante } from "@/modules/habitantes/components/ficha-habitante";
import { TalentosDeHabitante } from "@/modules/talentos/components/talentos-de-habitante";

export default function PaginaFichaHabitante({ params }: PageProps<"/habitantes/[id]">) {
  const idTexto = params.then(({ id }) => id);

  return (
    <div className="grid gap-10">
      <Suspense fallback={<p className="text-muted-foreground">Cargando persona…</p>}>
        <FichaHabitante idTexto={idTexto} />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground">Cargando talentos…</p>}>
        <TalentosDeHabitante idTexto={idTexto} />
      </Suspense>
    </div>
  );
}

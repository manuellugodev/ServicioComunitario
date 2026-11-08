import { Suspense } from "react";
import { FamiliasDeVivienda } from "@/modules/familias/components/familias-de-vivienda";
import { FichaVivienda } from "@/modules/viviendas/components/ficha-vivienda";

export default function PaginaFichaVivienda({ params }: PageProps<"/viviendas/[id]">) {
  const idTexto = params.then(({ id }) => id);

  return (
    <div className="grid gap-10">
      <Suspense fallback={<p className="text-muted-foreground">Cargando vivienda…</p>}>
        <FichaVivienda idTexto={idTexto} />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground">Cargando familias…</p>}>
        <FamiliasDeVivienda idTexto={idTexto} />
      </Suspense>
    </div>
  );
}

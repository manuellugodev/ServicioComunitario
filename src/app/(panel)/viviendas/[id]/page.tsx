import { Suspense } from "react";
import { FichaVivienda } from "@/modules/viviendas/components/ficha-vivienda";

export default function PaginaFichaVivienda({ params }: PageProps<"/viviendas/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando vivienda…</p>}>
      <FichaVivienda idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

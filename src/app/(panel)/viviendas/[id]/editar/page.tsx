import { Suspense } from "react";
import { EditarVivienda } from "@/modules/viviendas/components/editar-vivienda";

export default function PaginaEditarVivienda({ params }: PageProps<"/viviendas/[id]/editar">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando vivienda…</p>}>
      <EditarVivienda idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

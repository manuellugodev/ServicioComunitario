import { Suspense } from "react";
import { NuevaFamilia } from "@/modules/familias/components/nueva-familia";

export default function PaginaNuevaFamilia({ params }: PageProps<"/viviendas/[id]/familias/nueva">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando formulario…</p>}>
      <NuevaFamilia idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

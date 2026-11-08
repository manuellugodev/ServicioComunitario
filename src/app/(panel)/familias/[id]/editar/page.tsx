import { Suspense } from "react";
import { EditarFamilia } from "@/modules/familias/components/editar-familia";

export default function PaginaEditarFamilia({ params }: PageProps<"/familias/[id]/editar">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando familia…</p>}>
      <EditarFamilia idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

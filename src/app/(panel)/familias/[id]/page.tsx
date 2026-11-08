import { Suspense } from "react";
import { FichaFamilia } from "@/modules/familias/components/ficha-familia";

export default function PaginaFichaFamilia({ params }: PageProps<"/familias/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando familia…</p>}>
      <FichaFamilia idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

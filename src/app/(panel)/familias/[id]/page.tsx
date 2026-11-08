import { Suspense } from "react";
import { FichaFamilia } from "@/modules/familias/components/ficha-familia";
import { MiembrosDeFamilia } from "@/modules/habitantes/components/miembros-de-familia";

export default function PaginaFichaFamilia({ params }: PageProps<"/familias/[id]">) {
  const idTexto = params.then(({ id }) => id);

  return (
    <div className="grid gap-10">
      <Suspense fallback={<p className="text-muted-foreground">Cargando familia…</p>}>
        <FichaFamilia idTexto={idTexto} />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground">Cargando miembros…</p>}>
        <MiembrosDeFamilia idTexto={idTexto} />
      </Suspense>
    </div>
  );
}

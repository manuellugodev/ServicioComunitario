import { Suspense } from "react";
import { FichaProyecto } from "@/modules/proyectos/components/ficha-proyecto";

export default function PaginaFichaProyecto({ params }: PageProps<"/proyectos/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando proyecto…</p>}>
      <FichaProyecto idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

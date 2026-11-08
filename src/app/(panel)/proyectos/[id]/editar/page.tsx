import { Suspense } from "react";
import { EditarProyecto } from "@/modules/proyectos/components/editar-proyecto";

export default function PaginaEditarProyecto({ params }: PageProps<"/proyectos/[id]/editar">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando proyecto…</p>}>
      <EditarProyecto idTexto={params.then(({ id }) => id)} />
    </Suspense>
  );
}

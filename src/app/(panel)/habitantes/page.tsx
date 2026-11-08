import { Suspense } from "react";
import { BuscadorHabitantes } from "@/modules/habitantes/components/buscador-habitantes";

export default function PaginaHabitantes({ searchParams }: PageProps<"/habitantes">) {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Habitantes</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando habitantes…</p>}>
        <BuscadorHabitantes parametros={searchParams} />
      </Suspense>
    </div>
  );
}

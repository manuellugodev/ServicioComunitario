import { Suspense } from "react";
import { BuscadorTalentos } from "@/modules/talentos/components/buscador-talentos";

export default function PaginaTalentos({ searchParams }: PageProps<"/talentos">) {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Buscador de talentos</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando talentos…</p>}>
        <BuscadorTalentos parametros={searchParams} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { SoloEscritura } from "@/modules/seguridad/components/solo-escritura";
import { ListadoViviendas } from "@/modules/viviendas/components/listado-viviendas";
import { Button } from "@/shared/components/ui/button";

export default function PaginaViviendas({ searchParams }: PageProps<"/viviendas">) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Viviendas</h1>
        <SoloEscritura>
          <Button size="lg" render={<Link href="/viviendas/nueva" />} nativeButton={false}>
            Nueva vivienda
          </Button>
        </SoloEscritura>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Cargando viviendas…</p>}>
        <ListadoViviendas parametros={searchParams} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { ListadoProyectos } from "@/modules/proyectos/components/listado-proyectos";
import { SoloEscritura } from "@/modules/seguridad/components/solo-escritura";
import { Button } from "@/shared/components/ui/button";

export default function PaginaProyectos() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Proyectos</h1>
        <SoloEscritura>
          <Button size="lg" render={<Link href="/proyectos/nuevo" />} nativeButton={false}>
            Nuevo proyecto
          </Button>
        </SoloEscritura>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Cargando proyectos…</p>}>
        <ListadoProyectos />
      </Suspense>
    </div>
  );
}

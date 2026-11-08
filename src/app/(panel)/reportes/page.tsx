import { Suspense } from "react";
import { VistaReportes } from "@/modules/reportes/components/vista-reportes";

export default function PaginaReportes({ searchParams }: PageProps<"/reportes">) {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Reportes</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando reporte…</p>}>
        <VistaReportes parametros={searchParams} />
      </Suspense>
    </div>
  );
}

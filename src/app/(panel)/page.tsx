import { Suspense } from "react";
import { PanelResumen } from "@/modules/reportes/components/panel-resumen";

export default function PanelPrincipal() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Panel principal</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando panel…</p>}>
        <PanelResumen />
      </Suspense>
    </div>
  );
}

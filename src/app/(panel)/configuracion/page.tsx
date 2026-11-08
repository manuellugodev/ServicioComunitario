import { Suspense } from "react";
import { SeccionesConfiguracion } from "@/modules/configuracion/components/secciones-configuracion";

export default function PaginaConfiguracion() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Configuración</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando configuración…</p>}>
        <SeccionesConfiguracion />
      </Suspense>
    </div>
  );
}

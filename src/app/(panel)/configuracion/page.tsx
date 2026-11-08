import { Suspense } from "react";
import { SeccionesConfiguracion } from "@/modules/configuracion/components/secciones-configuracion";
import { CatalogoTalentos } from "@/modules/talentos/components/catalogo-talentos";

export default function PaginaConfiguracion() {
  return (
    <div className="grid gap-10">
      <h1 className="font-heading text-2xl font-semibold">Configuración</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando configuración…</p>}>
        <SeccionesConfiguracion />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground">Cargando talentos…</p>}>
        <CatalogoTalentos />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { NuevaVivienda } from "@/modules/viviendas/components/nueva-vivienda";

export default function PaginaNuevaVivienda() {
  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Nueva vivienda</h1>
      <Suspense fallback={<p className="text-muted-foreground">Cargando formulario…</p>}>
        <NuevaVivienda />
      </Suspense>
    </div>
  );
}

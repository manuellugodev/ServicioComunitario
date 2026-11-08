import { Suspense } from "react";
import { obtenerNombreConsejo } from "@/modules/configuracion/queries";

async function Nombre() {
  return obtenerNombreConsejo();
}

export function NombreConsejo() {
  return (
    <Suspense fallback="Consejo comunal">
      <Nombre />
    </Suspense>
  );
}

import { Suspense, type ReactNode } from "react";
import { puedeEscribir } from "@/shared/lib/roles";
import { requerirSesion } from "@/shared/lib/sesion";

async function SegunRol({ children }: { children: ReactNode }) {
  const { rol } = await requerirSesion();
  return puedeEscribir(rol) ? children : null;
}

export function SoloEscritura({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <SegunRol>{children}</SegunRol>
    </Suspense>
  );
}

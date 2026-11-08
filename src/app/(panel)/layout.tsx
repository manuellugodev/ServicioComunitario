import { Suspense } from "react";
import { NombreConsejo } from "@/modules/configuracion/components/nombre-consejo";
import {
  MenuMovilSegunRol,
  NavegacionSegunRol,
} from "@/modules/seguridad/components/navegacion-segun-rol";
import { UsuarioActual } from "@/modules/seguridad/components/usuario-actual";

export default function PanelLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r md:flex">
        <p className="p-4 font-heading font-semibold">
          <NombreConsejo />
        </p>
        <Suspense>
          <NavegacionSegunRol />
        </Suspense>
        <div className="mt-auto border-t">
          <Suspense>
            <UsuarioActual />
          </Suspense>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b p-2 md:hidden">
          <Suspense>
            <MenuMovilSegunRol titulo={<NombreConsejo />}>
              <Suspense>
                <UsuarioActual />
              </Suspense>
            </MenuMovilSegunRol>
          </Suspense>
          <span className="truncate font-heading font-semibold">
            <NombreConsejo />
          </span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

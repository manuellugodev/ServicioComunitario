import { Suspense } from "react";
import { UsuarioActual } from "@/modules/seguridad/components/usuario-actual";
import { MenuMovil } from "@/shared/components/menu-movil";
import { Navegacion } from "@/shared/components/navegacion";
import { NOMBRE_CONSEJO } from "@/shared/lib/consejo";

export default function PanelLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r md:flex">
        <p className="p-4 font-heading font-semibold">{NOMBRE_CONSEJO}</p>
        <Suspense>
          <Navegacion />
        </Suspense>
        <div className="mt-auto border-t">
          <Suspense>
            <UsuarioActual />
          </Suspense>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b p-2 md:hidden">
          <MenuMovil nombreConsejo={NOMBRE_CONSEJO}>
            <Suspense>
              <UsuarioActual />
            </Suspense>
          </MenuMovil>
          <span className="truncate font-heading font-semibold">{NOMBRE_CONSEJO}</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

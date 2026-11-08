"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderKanban,
  House,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

type Enlace = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  // Se activa cuando el módulo correspondiente esté construido.
  listo: boolean;
};

const ENLACES: Enlace[] = [
  { href: "/", etiqueta: "Panel principal", icono: LayoutDashboard, listo: true },
  { href: "/viviendas", etiqueta: "Viviendas", icono: House, listo: true },
  { href: "/habitantes", etiqueta: "Habitantes", icono: Users, listo: false },
  { href: "/talentos", etiqueta: "Talentos", icono: Wrench, listo: false },
  { href: "/proyectos", etiqueta: "Proyectos", icono: FolderKanban, listo: false },
  { href: "/reportes", etiqueta: "Reportes", icono: FileText, listo: false },
  { href: "/usuarios", etiqueta: "Usuarios", icono: UserCog, listo: true },
  { href: "/configuracion", etiqueta: "Configuración", icono: Settings, listo: true },
];

const CLASES_ENLACE = "flex items-center gap-3 rounded-md px-3 py-2.5 text-base";

export function Navegacion({ alNavegar }: { alNavegar?: () => void }) {
  const ruta = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {ENLACES.map(({ href, etiqueta, icono: Icono, listo }) => {
        if (!listo) {
          return (
            <span
              key={href}
              aria-disabled="true"
              className={cn(CLASES_ENLACE, "text-muted-foreground/60")}
            >
              <Icono className="size-5" />
              {etiqueta}
            </span>
          );
        }

        const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={alNavegar}
            aria-current={activo ? "page" : undefined}
            className={cn(
              CLASES_ENLACE,
              activo ? "bg-accent font-medium text-accent-foreground" : "hover:bg-accent/60"
            )}
          >
            <Icono className="size-5" />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

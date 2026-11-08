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
import { esAdmin, type Rol } from "@/shared/lib/roles";

type Enlace = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  soloAdmin?: boolean;
};

const ENLACES: Enlace[] = [
  { href: "/", etiqueta: "Panel principal", icono: LayoutDashboard },
  { href: "/viviendas", etiqueta: "Viviendas", icono: House },
  { href: "/habitantes", etiqueta: "Habitantes", icono: Users },
  { href: "/talentos", etiqueta: "Talentos", icono: Wrench },
  { href: "/proyectos", etiqueta: "Proyectos", icono: FolderKanban },
  { href: "/reportes", etiqueta: "Reportes", icono: FileText },
  { href: "/usuarios", etiqueta: "Usuarios", icono: UserCog, soloAdmin: true },
  { href: "/configuracion", etiqueta: "Configuración", icono: Settings, soloAdmin: true },
];

type Props = {
  rol: Rol;
  alNavegar?: () => void;
};

export function Navegacion({ rol, alNavegar }: Props) {
  const ruta = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {ENLACES.filter(({ soloAdmin }) => !soloAdmin || esAdmin(rol)).map(
        ({ href, etiqueta, icono: Icono }) => {
          const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={alNavegar}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-base",
                activo ? "bg-accent font-medium text-accent-foreground" : "hover:bg-accent/60"
              )}
            >
              <Icono className="size-5" />
              {etiqueta}
            </Link>
          );
        }
      )}
    </nav>
  );
}

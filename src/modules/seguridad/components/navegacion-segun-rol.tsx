import type { ReactNode } from "react";
import { MenuMovil } from "@/shared/components/menu-movil";
import { Navegacion } from "@/shared/components/navegacion";
import { requerirSesion } from "@/shared/lib/sesion";

export async function NavegacionSegunRol() {
  const { rol } = await requerirSesion();
  return <Navegacion rol={rol} />;
}

type Props = {
  titulo: ReactNode;
  children: ReactNode;
};

export async function MenuMovilSegunRol({ titulo, children }: Props) {
  const { rol } = await requerirSesion();
  return (
    <MenuMovil titulo={titulo} rol={rol}>
      {children}
    </MenuMovil>
  );
}

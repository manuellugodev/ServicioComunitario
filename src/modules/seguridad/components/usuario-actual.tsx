import Link from "next/link";
import { cerrarSesion } from "@/modules/seguridad/actions";
import { ETIQUETAS_ROL } from "@/modules/seguridad/schemas";
import { Button } from "@/shared/components/ui/button";
import { requerirSesion } from "@/shared/lib/sesion";

export async function UsuarioActual() {
  const usuario = await requerirSesion();

  return (
    <div className="grid gap-2 p-3">
      <div>
        <p className="truncate font-medium">{usuario.nombreCompleto}</p>
        <p className="text-sm text-muted-foreground">{ETIQUETAS_ROL[usuario.rol]}</p>
      </div>
      <Link href="/cambiar-contrasena" className="text-sm underline">
        Cambiar contraseña
      </Link>
      <form action={cerrarSesion}>
        <Button type="submit" variant="outline" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

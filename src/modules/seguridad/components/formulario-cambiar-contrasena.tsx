"use client";

import { useActionState } from "react";
import { cambiarMiContrasena } from "@/modules/seguridad/actions";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";

export function FormularioCambiarContrasena() {
  const [estado, accion, pendiente] = useActionState(cambiarMiContrasena, {});

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <Campo
        name="actual"
        etiqueta="Contraseña actual"
        type="password"
        autoComplete="current-password"
        required
        errores={estado.errores?.actual}
      />
      <Campo
        name="nueva"
        etiqueta="Contraseña nueva"
        type="password"
        autoComplete="new-password"
        required
        errores={estado.errores?.nueva}
      />
      <Campo
        name="confirmacion"
        etiqueta="Repite la contraseña nueva"
        type="password"
        autoComplete="new-password"
        required
        errores={estado.errores?.confirmacion}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}

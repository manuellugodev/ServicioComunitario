"use client";

import { useActionState } from "react";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Props = {
  accionServidor: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
};

export function FormularioRestablecerContrasena({ accionServidor }: Props) {
  const [estado, accion, pendiente] = useActionState(accionServidor, {});

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <Campo
        name="contrasena"
        etiqueta="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        required
        errores={estado.errores?.contrasena}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" variant="outline" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Restablecer contraseña"}
      </Button>
    </form>
  );
}

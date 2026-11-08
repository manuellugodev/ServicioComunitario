"use client";

import { useActionState } from "react";
import { iniciarSesion } from "@/modules/seguridad/actions";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";

export function FormularioInicioSesion() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, {});

  return (
    <form action={accion} className="grid gap-4">
      <Campo
        name="usuario"
        etiqueta="Usuario"
        autoComplete="username"
        autoCapitalize="none"
        required
        defaultValue={estado.valores?.usuario}
        errores={estado.errores?.usuario}
      />
      <Campo
        name="contrasena"
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        errores={estado.errores?.contrasena}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente}>
        {pendiente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { actualizarNombreConsejo } from "@/modules/configuracion/actions";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";

export function FormularioNombreConsejo({ nombre }: { nombre: string }) {
  const [estado, accion, pendiente] = useActionState(actualizarNombreConsejo, {});

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <Campo
        name="nombreConsejo"
        etiqueta="Nombre del consejo comunal"
        required
        defaultValue={estado.valores?.nombreConsejo ?? nombre}
        errores={estado.errores?.nombreConsejo}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Guardar nombre"}
      </Button>
    </form>
  );
}

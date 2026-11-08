"use client";

import { useActionState } from "react";
import {
  AvisoFormulario,
  Campo,
  CampoCasilla,
  CampoTexto,
} from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Valores = {
  ingresoAproxUsd: string | null;
  recibeClap: boolean;
  observaciones: string | null;
};

type Props = {
  accionServidor: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  familia?: Valores;
};

export function FormularioFamilia({ accionServidor, familia }: Props) {
  const [estado, accion, pendiente] = useActionState(accionServidor, {});

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <Campo
        name="ingresoAproxUsd"
        etiqueta="Ingreso familiar mensual aproximado (USD, opcional)"
        inputMode="decimal"
        defaultValue={estado.valores?.ingresoAproxUsd ?? familia?.ingresoAproxUsd ?? ""}
        errores={estado.errores?.ingresoAproxUsd}
      />
      <CampoCasilla
        name="recibeClap"
        etiqueta="Recibe bolsa CLAP"
        defaultChecked={estado.valores ? estado.valores.recibeClap === "on" : familia?.recibeClap}
      />
      <CampoTexto
        name="observaciones"
        etiqueta="Observaciones"
        defaultValue={estado.valores?.observaciones ?? familia?.observaciones ?? ""}
        errores={estado.errores?.observaciones}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}

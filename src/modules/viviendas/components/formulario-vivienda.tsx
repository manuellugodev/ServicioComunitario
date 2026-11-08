"use client";

import { useActionState } from "react";
import { ETIQUETAS_TENENCIA, SERVICIOS, TENENCIAS } from "@/modules/viviendas/schemas";
import { AvisoFormulario, Campo, CampoSelect, CampoTexto } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Catalogo = { id: number; nombre: string }[];

type Valores = {
  sectorId: number;
  tipoViviendaId: number;
  direccion: string;
  tenencia: string | null;
  agua: boolean;
  electricidad: boolean;
  gas: boolean;
  aseo: boolean;
  internet: boolean;
  observaciones: string | null;
};

type Props = {
  accionServidor: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  sectores: Catalogo;
  tipos: Catalogo;
  vivienda?: Valores;
};

const aOpciones = (catalogo: Catalogo) =>
  catalogo.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }));

export function FormularioVivienda({ accionServidor, sectores, tipos, vivienda }: Props) {
  const [estado, accion, pendiente] = useActionState(accionServidor, {});
  const valorDe = (campo: "sectorId" | "tipoViviendaId" | "direccion" | "tenencia" | "observaciones") =>
    estado.valores?.[campo] ?? String(vivienda?.[campo] ?? "");

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <CampoSelect
        name="sectorId"
        etiqueta="Sector"
        opciones={aOpciones(sectores)}
        vacio="Selecciona…"
        required
        defaultValue={valorDe("sectorId")}
        errores={estado.errores?.sectorId}
      />
      <Campo
        name="direccion"
        etiqueta="Dirección o punto de referencia"
        required
        defaultValue={valorDe("direccion")}
        errores={estado.errores?.direccion}
      />
      <CampoSelect
        name="tipoViviendaId"
        etiqueta="Tipo de vivienda"
        opciones={aOpciones(tipos)}
        vacio="Selecciona…"
        required
        defaultValue={valorDe("tipoViviendaId")}
        errores={estado.errores?.tipoViviendaId}
      />
      <CampoSelect
        name="tenencia"
        etiqueta="Tenencia"
        opciones={TENENCIAS.map((valor) => ({ valor, etiqueta: ETIQUETAS_TENENCIA[valor] }))}
        vacio="Sin indicar"
        defaultValue={valorDe("tenencia")}
        errores={estado.errores?.tenencia}
      />
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Servicios básicos</legend>
        {SERVICIOS.map(({ campo, etiqueta }) => (
          <label key={campo} className="flex items-center gap-3 text-base">
            <input
              type="checkbox"
              name={campo}
              className="size-5 accent-primary"
              defaultChecked={estado.valores ? estado.valores[campo] === "on" : vivienda?.[campo]}
            />
            {etiqueta}
          </label>
        ))}
      </fieldset>
      <CampoTexto
        name="observaciones"
        etiqueta="Observaciones"
        defaultValue={valorDe("observaciones")}
        errores={estado.errores?.observaciones}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}

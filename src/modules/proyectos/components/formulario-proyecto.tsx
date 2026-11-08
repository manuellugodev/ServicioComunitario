"use client";

import { useActionState } from "react";
import { ESTADOS_PROYECTO, ETIQUETAS_ESTADO_PROYECTO } from "@/modules/proyectos/schemas";
import { AvisoFormulario, Campo, CampoSelect, CampoTexto } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Valores = {
  nombre: string;
  descripcion: string | null;
  responsableId: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
};

type Props = {
  accionServidor: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  usuarios: { id: number; nombreCompleto: string }[];
  proyecto?: Valores;
};

export function FormularioProyecto({ accionServidor, usuarios, proyecto }: Props) {
  const [estado, accion, pendiente] = useActionState(accionServidor, {});
  const valorDe = (campo: keyof Valores) => estado.valores?.[campo] ?? proyecto?.[campo] ?? "";

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <Campo
        name="nombre"
        etiqueta="Nombre del proyecto"
        required
        defaultValue={valorDe("nombre")}
        errores={estado.errores?.nombre}
      />
      <CampoTexto
        name="descripcion"
        etiqueta="Objetivo y alcance"
        defaultValue={valorDe("descripcion")}
        errores={estado.errores?.descripcion}
      />
      <CampoSelect
        name="responsableId"
        etiqueta="Vocero responsable"
        opciones={usuarios.map(({ id, nombreCompleto }) => ({ valor: id, etiqueta: nombreCompleto }))}
        vacio="Selecciona…"
        required
        defaultValue={valorDe("responsableId")}
        errores={estado.errores?.responsableId}
      />
      <Campo
        name="fechaInicio"
        etiqueta="Fecha de inicio"
        type="date"
        defaultValue={valorDe("fechaInicio")}
        errores={estado.errores?.fechaInicio}
      />
      <Campo
        name="fechaFin"
        etiqueta="Fecha de fin"
        type="date"
        defaultValue={valorDe("fechaFin")}
        errores={estado.errores?.fechaFin}
      />
      <CampoSelect
        name="estado"
        etiqueta="Estado"
        opciones={ESTADOS_PROYECTO.map((valor) => ({
          valor,
          etiqueta: ETIQUETAS_ESTADO_PROYECTO[valor],
        }))}
        required
        defaultValue={valorDe("estado") || "PROPUESTO"}
        errores={estado.errores?.estado}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  actualizarCantidad,
  agregarRequerimiento,
  quitarRequerimiento,
} from "@/modules/proyectos/actions";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";
import { AvisoFormulario, Campo, CampoSelect } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";

type Requerimiento = {
  talentoId: number;
  cantidadRequerida: number;
  nombre: string;
  categoria: string;
  asignados: number;
};

type Opcion = { id: number; nombre: string; categoria: string };

function FilaRequerimiento({
  proyectoId,
  requerimiento,
}: {
  proyectoId: number;
  requerimiento: Requerimiento;
}) {
  const { talentoId, nombre, categoria, asignados, cantidadRequerida } = requerimiento;
  const [estado, accion, pendiente] = useActionState(
    actualizarCantidad.bind(null, proyectoId, talentoId),
    {}
  );

  return (
    <li className="grid gap-2 border-b py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p>
          <span className="font-medium">{nombre}</span>{" "}
          <span className="text-muted-foreground">· {categoria}</span>
          <span className="block text-sm text-muted-foreground">
            {asignados} de {cantidadRequerida} asignados
          </span>
        </p>
        <BotonConfirmar
          etiqueta="Quitar"
          titulo={`¿Quitar "${nombre}" del proyecto?`}
          descripcion="El proyecto dejará de requerir este talento."
          confirmar="Quitar"
          tamano="sm"
          accion={() => quitarRequerimiento(proyectoId, talentoId)}
        />
      </div>
      <form action={accion} className="grid max-w-xs gap-2">
        <Campo
          id={`cantidad-${talentoId}`}
          name="cantidadRequerida"
          etiqueta="Personas requeridas"
          type="number"
          min={1}
          max={999}
          required
          defaultValue={estado.valores?.cantidadRequerida ?? cantidadRequerida}
          errores={estado.errores?.cantidadRequerida}
        />
        <AvisoFormulario estado={estado} />
        <Button type="submit" variant="outline" size="sm" disabled={pendiente} className="w-fit">
          {pendiente ? "Guardando…" : "Guardar cantidad"}
        </Button>
      </form>
    </li>
  );
}

function FormularioAgregar({ proyectoId, opciones }: { proyectoId: number; opciones: Opcion[] }) {
  const [estado, accion, pendiente] = useActionState(
    agregarRequerimiento.bind(null, proyectoId),
    {}
  );

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <CampoSelect
        id="talento-requerido"
        name="talentoId"
        etiqueta="Agregar talento requerido"
        opciones={opciones.map(({ id, nombre, categoria }) => ({
          valor: id,
          etiqueta: `${nombre} (${categoria})`,
        }))}
        vacio="Selecciona…"
        required
        defaultValue={estado.valores?.talentoId ?? ""}
        errores={estado.errores?.talentoId}
      />
      <Campo
        id="cantidad-nueva"
        name="cantidadRequerida"
        etiqueta="Personas requeridas"
        type="number"
        min={1}
        max={999}
        required
        defaultValue={estado.valores?.cantidadRequerida ?? 1}
        errores={estado.errores?.cantidadRequerida}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Agregando…" : "Agregar"}
      </Button>
    </form>
  );
}

type Props = {
  proyectoId: number;
  requerimientos: Requerimiento[];
  opciones: Opcion[];
};

export function TalentosRequeridos({ proyectoId, requerimientos, opciones }: Props) {
  return (
    <section className="grid max-w-2xl gap-4">
      <h2 className="font-heading text-lg font-semibold">Talentos requeridos</h2>
      {requerimientos.length === 0 ? (
        <p className="text-muted-foreground">Este proyecto todavía no indica talentos.</p>
      ) : (
        <ul>
          {requerimientos.map((requerimiento) => (
            <FilaRequerimiento
              key={requerimiento.talentoId}
              proyectoId={proyectoId}
              requerimiento={requerimiento}
            />
          ))}
        </ul>
      )}
      {opciones.length > 0 ? (
        <FormularioAgregar proyectoId={proyectoId} opciones={opciones} />
      ) : (
        <p className="text-muted-foreground">
          No hay más talentos para agregar. Puedes registrarlos en{" "}
          <Link href="/configuracion" className="underline">
            Configuración
          </Link>
          .
        </p>
      )}
    </section>
  );
}

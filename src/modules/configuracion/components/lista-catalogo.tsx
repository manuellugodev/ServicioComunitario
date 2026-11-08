"use client";

import { useActionState, useState } from "react";
import { eliminarElemento, guardarElemento } from "@/modules/configuracion/actions";
import type { Catalogo } from "@/modules/configuracion/schemas";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Elemento = { id: number; nombre: string };

function FormularioAgregar({ catalogo, singular }: { catalogo: Catalogo; singular: string }) {
  const [estado, accion, pendiente] = useActionState(
    guardarElemento.bind(null, catalogo, null),
    {}
  );

  return (
    <form action={accion} className="grid max-w-md gap-3">
      <Campo
        id={`nuevo-${catalogo}`}
        name="nombre"
        etiqueta={`Agregar ${singular}`}
        required
        defaultValue={estado.valores?.nombre}
        errores={estado.errores?.nombre}
      />
      <AvisoFormulario estado={estado} />
      <Button type="submit" disabled={pendiente} className="w-fit">
        {pendiente ? "Agregando…" : "Agregar"}
      </Button>
    </form>
  );
}

type PropsEditar = {
  catalogo: Catalogo;
  elemento: Elemento;
  alCerrar: () => void;
};

function FormularioEditar({ catalogo, elemento, alCerrar }: PropsEditar) {
  const [estado, accion, pendiente] = useActionState(
    async (previo: EstadoFormulario, formData: FormData) => {
      const resultado = await guardarElemento(catalogo, elemento.id, previo, formData);
      if (!resultado.error && !resultado.errores) {
        alCerrar();
      }
      return resultado;
    },
    {}
  );

  return (
    <form action={accion} className="grid flex-1 gap-3">
      <Campo
        id={`editar-${catalogo}-${elemento.id}`}
        name="nombre"
        etiqueta="Nombre"
        required
        defaultValue={estado.valores?.nombre ?? elemento.nombre}
        errores={estado.errores?.nombre}
      />
      <AvisoFormulario estado={estado} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={alCerrar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function FilaCatalogo({ catalogo, elemento }: { catalogo: Catalogo; elemento: Elemento }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="border-b py-3">
        <FormularioEditar
          catalogo={catalogo}
          elemento={elemento}
          alCerrar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-start justify-between gap-2 border-b py-2">
      <span className="py-1">{elemento.nombre}</span>
      <div className="flex items-start gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
          Editar
        </Button>
        <BotonConfirmar
          etiqueta="Eliminar"
          titulo={`¿Eliminar "${elemento.nombre}"?`}
          descripcion="Esta acción no se puede deshacer."
          confirmar="Eliminar"
          tamano="sm"
          accion={() => eliminarElemento(catalogo, elemento.id)}
        />
      </div>
    </li>
  );
}

type Props = {
  titulo: string;
  singular: string;
  catalogo: Catalogo;
  elementos: Elemento[];
};

export function ListaCatalogo({ titulo, singular, catalogo, elementos }: Props) {
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
      {elementos.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay registros.</p>
      ) : (
        <ul className="max-w-2xl">
          {elementos.map((elemento) => (
            <FilaCatalogo key={elemento.id} catalogo={catalogo} elemento={elemento} />
          ))}
        </ul>
      )}
      <FormularioAgregar catalogo={catalogo} singular={singular} />
    </section>
  );
}

"use client";

import { useActionState, useState } from "react";
import { eliminarTalentoCatalogo, guardarTalentoCatalogo } from "@/modules/talentos/actions";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";
import { AvisoFormulario, Campo, CampoSelect } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Categoria = { id: number; nombre: string };
type Talento = {
  id: number;
  nombre: string;
  categoriaId: number;
  categoria: { nombre: string };
};

type PropsCampos = {
  sufijo: string;
  categorias: Categoria[];
  estado: EstadoFormulario;
  talento?: Talento;
};

function CamposTalento({ sufijo, categorias, estado, talento }: PropsCampos) {
  return (
    <>
      <CampoSelect
        id={`categoria-${sufijo}`}
        name="categoriaId"
        etiqueta="Categoría"
        opciones={categorias.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }))}
        vacio="Selecciona…"
        required
        defaultValue={estado.valores?.categoriaId ?? (talento ? String(talento.categoriaId) : "")}
        errores={estado.errores?.categoriaId}
      />
      <Campo
        id={`talento-${sufijo}`}
        name="nombre"
        etiqueta="Nombre del talento"
        required
        defaultValue={estado.valores?.nombre ?? talento?.nombre}
        errores={estado.errores?.nombre}
      />
      <AvisoFormulario estado={estado} />
    </>
  );
}

function FormularioAgregar({ categorias }: { categorias: Categoria[] }) {
  const [estado, accion, pendiente] = useActionState(guardarTalentoCatalogo.bind(null, null), {});

  return (
    <form action={accion} className="grid max-w-md gap-3">
      <CamposTalento sufijo="nuevo" categorias={categorias} estado={estado} />
      <Button type="submit" disabled={pendiente} className="w-fit">
        {pendiente ? "Agregando…" : "Agregar"}
      </Button>
    </form>
  );
}

type PropsEditar = {
  talento: Talento;
  categorias: Categoria[];
  alCerrar: () => void;
};

function FormularioEditar({ talento, categorias, alCerrar }: PropsEditar) {
  const [estado, accion, pendiente] = useActionState(
    async (previo: EstadoFormulario, formData: FormData) => {
      const resultado = await guardarTalentoCatalogo(talento.id, previo, formData);
      if (!resultado.error && !resultado.errores) {
        alCerrar();
      }
      return resultado;
    },
    {}
  );

  return (
    <form action={accion} className="grid flex-1 gap-3">
      <CamposTalento
        sufijo={String(talento.id)}
        categorias={categorias}
        estado={estado}
        talento={talento}
      />
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

function FilaTalento({ talento, categorias }: { talento: Talento; categorias: Categoria[] }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="border-b py-3">
        <FormularioEditar
          talento={talento}
          categorias={categorias}
          alCerrar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-start justify-between gap-2 border-b py-2">
      <span className="py-1">
        {talento.nombre} <span className="text-muted-foreground">· {talento.categoria.nombre}</span>
      </span>
      <div className="flex items-start gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
          Editar
        </Button>
        <BotonConfirmar
          etiqueta="Eliminar"
          titulo={`¿Eliminar "${talento.nombre}"?`}
          descripcion="Esta acción no se puede deshacer."
          confirmar="Eliminar"
          tamano="sm"
          accion={() => eliminarTalentoCatalogo(talento.id)}
        />
      </div>
    </li>
  );
}

type Props = {
  categorias: Categoria[];
  talentos: Talento[];
};

export function ListaTalentosCatalogo({ categorias, talentos }: Props) {
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-lg font-semibold">Talentos</h2>
      {talentos.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay registros.</p>
      ) : (
        <ul className="max-w-2xl">
          {talentos.map((talento) => (
            <FilaTalento key={talento.id} talento={talento} categorias={categorias} />
          ))}
        </ul>
      )}
      <FormularioAgregar categorias={categorias} />
    </section>
  );
}

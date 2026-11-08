"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { asignarTalento, editarAsignacion, quitarTalento } from "@/modules/talentos/actions";
import { ETIQUETAS_NIVEL_TALENTO, NIVELES, type Nivel } from "@/modules/talentos/schemas";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";
import { AvisoFormulario, Campo, CampoCasilla, CampoSelect } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Categoria = { id: number; nombre: string };
type Talento = { id: number; nombre: string; categoriaId: number };
type Asignacion = {
  talentoId: number;
  nivel: Nivel;
  aniosExperiencia: number;
  certificado: boolean;
  disponible: boolean;
  talento: { nombre: string; categoria: { nombre: string } };
};

type PropsCampos = {
  sufijo: string;
  estado: EstadoFormulario;
  asignacion?: Asignacion;
};

function CamposAsignacion({ sufijo, estado, asignacion }: PropsCampos) {
  return (
    <>
      <CampoSelect
        id={`nivel-${sufijo}`}
        name="nivel"
        etiqueta="Nivel"
        opciones={NIVELES.map((valor) => ({ valor, etiqueta: ETIQUETAS_NIVEL_TALENTO[valor] }))}
        vacio="Selecciona…"
        required
        defaultValue={estado.valores?.nivel ?? asignacion?.nivel}
        errores={estado.errores?.nivel}
      />
      <Campo
        id={`anios-${sufijo}`}
        name="aniosExperiencia"
        etiqueta="Años de experiencia"
        type="number"
        min={0}
        max={80}
        inputMode="numeric"
        required
        defaultValue={estado.valores?.aniosExperiencia ?? asignacion?.aniosExperiencia ?? 0}
        errores={estado.errores?.aniosExperiencia}
      />
      <CampoCasilla
        name="certificado"
        etiqueta="Tiene título o certificado"
        defaultChecked={estado.valores ? estado.valores.certificado === "on" : asignacion?.certificado}
      />
      <CampoCasilla
        name="disponible"
        etiqueta="Dispuesto(a) a colaborar en proyectos"
        defaultChecked={estado.valores ? estado.valores.disponible === "on" : (asignacion?.disponible ?? true)}
      />
      <AvisoFormulario estado={estado} />
    </>
  );
}

type PropsAgregar = {
  habitanteId: number;
  categorias: Categoria[];
  talentos: Talento[];
};

function FormularioAgregar({ habitanteId, categorias, talentos }: PropsAgregar) {
  const [categoria, setCategoria] = useState("");
  const [estado, accion, pendiente] = useActionState(
    async (previo: EstadoFormulario, formData: FormData) => {
      const resultado = await asignarTalento(habitanteId, previo, formData);
      if (!resultado.error && !resultado.errores) {
        setCategoria("");
      }
      return resultado;
    },
    {}
  );

  const opcionesTalento = talentos
    .filter(({ categoriaId }) => String(categoriaId) === categoria)
    .map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }));

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <h3 className="font-medium">Agregar talento</h3>
      <CampoSelect
        id="categoria-asignar"
        name="categoriaId"
        etiqueta="Categoría"
        opciones={categorias.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }))}
        vacio="Selecciona…"
        defaultValue={estado.valores?.categoriaId ?? ""}
        onChange={setCategoria}
      />
      <CampoSelect
        key={categoria}
        id="talento-asignar"
        name="talentoId"
        etiqueta="Talento"
        opciones={opcionesTalento}
        vacio={categoria ? "Selecciona…" : "Primero elige una categoría"}
        required
        defaultValue={estado.valores?.talentoId ?? ""}
        errores={estado.errores?.talentoId}
      />
      <CamposAsignacion sufijo="asignar" estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Agregando…" : "Agregar talento"}
      </Button>
    </form>
  );
}

type PropsEditar = {
  habitanteId: number;
  asignacion: Asignacion;
  alCerrar: () => void;
};

function FormularioEditar({ habitanteId, asignacion, alCerrar }: PropsEditar) {
  const [estado, accion, pendiente] = useActionState(
    async (previo: EstadoFormulario, formData: FormData) => {
      const resultado = await editarAsignacion(habitanteId, asignacion.talentoId, previo, formData);
      if (!resultado.error && !resultado.errores) {
        alCerrar();
      }
      return resultado;
    },
    {}
  );

  return (
    <form action={accion} className="grid gap-3">
      <p className="font-medium">{asignacion.talento.nombre}</p>
      <CamposAsignacion
        sufijo={String(asignacion.talentoId)}
        estado={estado}
        asignacion={asignacion}
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

type PropsFila = {
  habitanteId: number;
  asignacion: Asignacion;
  puedeEditar: boolean;
  puedeQuitar: boolean;
};

function FilaAsignacion({ habitanteId, asignacion, puedeEditar, puedeQuitar }: PropsFila) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="border-b py-3">
        <FormularioEditar
          habitanteId={habitanteId}
          asignacion={asignacion}
          alCerrar={() => setEditando(false)}
        />
      </li>
    );
  }

  const detalles = [
    ETIQUETAS_NIVEL_TALENTO[asignacion.nivel],
    `${asignacion.aniosExperiencia} ${asignacion.aniosExperiencia === 1 ? "año" : "años"}`,
    asignacion.certificado && "Certificado",
    asignacion.disponible ? "Disponible" : "No disponible",
  ].filter(Boolean);

  return (
    <li className="flex flex-wrap items-start justify-between gap-2 border-b py-2">
      <div>
        <p className="font-medium">
          {asignacion.talento.nombre}{" "}
          <span className="font-normal text-muted-foreground">
            · {asignacion.talento.categoria.nombre}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">{detalles.join(" · ")}</p>
      </div>
      <div className="flex items-start gap-2">
        {puedeEditar && (
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            Editar
          </Button>
        )}
        {puedeQuitar && (
          <BotonConfirmar
            etiqueta="Quitar"
            titulo={`¿Quitar "${asignacion.talento.nombre}"?`}
            descripcion="Se quitará este talento de la persona."
            confirmar="Quitar"
            tamano="sm"
            accion={() => quitarTalento(habitanteId, asignacion.talentoId)}
          />
        )}
      </div>
    </li>
  );
}

type Props = {
  habitanteId: number;
  asignaciones: Asignacion[];
  categorias: Categoria[];
  talentos: Talento[];
  puedeEditar: boolean;
  puedeQuitar: boolean;
};

export function AsignacionesTalento({
  habitanteId,
  asignaciones,
  categorias,
  talentos,
  puedeEditar,
  puedeQuitar,
}: Props) {
  const asignados = new Set(asignaciones.map(({ talentoId }) => talentoId));
  const disponibles = talentos.filter(({ id }) => !asignados.has(id));

  return (
    <section className="grid max-w-2xl gap-4">
      <h2 className="font-heading text-lg font-semibold">Talentos</h2>
      {asignaciones.length === 0 ? (
        <p className="text-muted-foreground">Esta persona no tiene talentos registrados.</p>
      ) : (
        <ul>
          {asignaciones.map((asignacion) => (
            <FilaAsignacion
              key={asignacion.talentoId}
              habitanteId={habitanteId}
              asignacion={asignacion}
              puedeEditar={puedeEditar}
              puedeQuitar={puedeQuitar}
            />
          ))}
        </ul>
      )}
      {puedeEditar &&
        (talentos.length === 0 ? (
          <p className="text-muted-foreground">
            Primero registra talentos en{" "}
            <Link href="/configuracion" className="underline">
              Configuración
            </Link>
            .
          </p>
        ) : (
          <FormularioAgregar
            habitanteId={habitanteId}
            categorias={categorias}
            talentos={disponibles}
          />
        ))}
    </section>
  );
}

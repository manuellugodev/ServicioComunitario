"use client";

import { useActionState, useRef, useState, type KeyboardEvent } from "react";
import {
  ETIQUETAS_NACIONALIDAD,
  ETIQUETAS_NIVEL,
  ETIQUETAS_PARENTESCO,
  ETIQUETAS_SEXO,
  NACIONALIDADES,
  NIVELES_EDUCATIVOS,
  PARENTESCOS,
  SEXOS,
} from "@/modules/habitantes/schemas";
import { AvisoFormulario, Campo, CampoCasilla, CampoSelect } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type CampoTexto =
  | "nombres"
  | "apellidos"
  | "nacionalidad"
  | "cedula"
  | "fechaNacimiento"
  | "sexo"
  | "parentesco"
  | "telefono"
  | "correo"
  | "nivelEducativo"
  | "ocupacion"
  | "discapacidad"
  | "enfermedadCronica";

type Valores = Record<CampoTexto, string | null> & { estudiaActualmente: boolean };

const PASOS = [
  {
    titulo: "Datos personales",
    campos: [
      "nombres",
      "apellidos",
      "nacionalidad",
      "cedula",
      "fechaNacimiento",
      "sexo",
      "parentesco",
      "telefono",
      "correo",
    ],
  },
  { titulo: "Educación y trabajo", campos: ["nivelEducativo", "ocupacion"] },
  { titulo: "Salud", campos: ["discapacidad", "enfermedadCronica"] },
];

const ULTIMO_PASO = PASOS.length - 1;

function pasoConError(errores: NonNullable<EstadoFormulario["errores"]>) {
  const indice = PASOS.findIndex(({ campos }) => campos.some((campo) => errores[campo]));
  return Math.max(indice, 0);
}

function opciones<T extends string>(valores: readonly T[], etiquetas: Record<T, string>) {
  return valores.map((valor) => ({ valor, etiqueta: etiquetas[valor] }));
}

type Props = {
  accionServidor: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  habitante?: Valores;
  parentescoInicial?: string;
};

export function FormularioHabitante({ accionServidor, habitante, parentescoInicial }: Props) {
  const formulario = useRef<HTMLFormElement>(null);
  const [paso, setPaso] = useState(0);
  const [estado, accion, pendiente] = useActionState(
    async (previo: EstadoFormulario, formData: FormData) => {
      const resultado = await accionServidor(previo, formData);
      if (resultado.errores) {
        setPaso(pasoConError(resultado.errores));
      }
      return resultado;
    },
    {}
  );

  const valorDe = (campo: CampoTexto) => estado.valores?.[campo] ?? habitante?.[campo] ?? "";

  function siguiente() {
    const controles = formulario.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      `[data-paso="${paso}"] input, [data-paso="${paso}"] select`
    );
    const validos = Array.from(controles ?? []).every((control) => control.reportValidity());
    if (validos) {
      setPaso(paso + 1);
    }
  }

  // Sin esto, Enter en un campo enviaría el formulario antes del último paso.
  function alPresionarTecla(evento: KeyboardEvent<HTMLFormElement>) {
    if (evento.key === "Enter" && paso < ULTIMO_PASO && evento.target instanceof HTMLInputElement) {
      evento.preventDefault();
      siguiente();
    }
  }

  const clasesPaso = (indice: number) => (paso === indice ? "grid gap-4" : "hidden");

  return (
    <form
      ref={formulario}
      action={accion}
      noValidate
      onKeyDown={alPresionarTecla}
      className="grid max-w-md gap-4"
    >
      <p className="text-sm text-muted-foreground">
        Paso {paso + 1} de {PASOS.length}: <span className="font-medium">{PASOS[paso].titulo}</span>
      </p>

      <div data-paso="0" className={clasesPaso(0)}>
        <Campo
          name="nombres"
          etiqueta="Nombres"
          required
          defaultValue={valorDe("nombres")}
          errores={estado.errores?.nombres}
        />
        <Campo
          name="apellidos"
          etiqueta="Apellidos"
          required
          defaultValue={valorDe("apellidos")}
          errores={estado.errores?.apellidos}
        />
        <CampoSelect
          name="nacionalidad"
          etiqueta="Nacionalidad"
          opciones={opciones(NACIONALIDADES, ETIQUETAS_NACIONALIDAD)}
          required
          defaultValue={valorDe("nacionalidad") || "V"}
          errores={estado.errores?.nacionalidad}
        />
        <Campo
          name="cedula"
          etiqueta="Cédula (vacío para menores sin cédula)"
          inputMode="numeric"
          defaultValue={valorDe("cedula")}
          errores={estado.errores?.cedula}
        />
        <Campo
          name="fechaNacimiento"
          etiqueta="Fecha de nacimiento"
          type="date"
          required
          defaultValue={valorDe("fechaNacimiento")}
          errores={estado.errores?.fechaNacimiento}
        />
        <CampoSelect
          name="sexo"
          etiqueta="Sexo"
          opciones={opciones(SEXOS, ETIQUETAS_SEXO)}
          vacio="Selecciona…"
          required
          defaultValue={valorDe("sexo")}
          errores={estado.errores?.sexo}
        />
        <CampoSelect
          name="parentesco"
          etiqueta="Parentesco con el jefe(a)"
          opciones={opciones(PARENTESCOS, ETIQUETAS_PARENTESCO)}
          vacio="Selecciona…"
          required
          defaultValue={valorDe("parentesco") || parentescoInicial}
          errores={estado.errores?.parentesco}
        />
        <Campo
          name="telefono"
          etiqueta="Teléfono"
          type="tel"
          defaultValue={valorDe("telefono")}
          errores={estado.errores?.telefono}
        />
        <Campo
          name="correo"
          etiqueta="Correo"
          type="email"
          autoCapitalize="none"
          defaultValue={valorDe("correo")}
          errores={estado.errores?.correo}
        />
      </div>

      <div data-paso="1" className={clasesPaso(1)}>
        <CampoSelect
          name="nivelEducativo"
          etiqueta="Nivel educativo"
          opciones={opciones(NIVELES_EDUCATIVOS, ETIQUETAS_NIVEL)}
          vacio="Sin indicar"
          defaultValue={valorDe("nivelEducativo")}
          errores={estado.errores?.nivelEducativo}
        />
        <CampoCasilla
          name="estudiaActualmente"
          etiqueta="Estudia actualmente"
          defaultChecked={
            estado.valores
              ? estado.valores.estudiaActualmente === "on"
              : habitante?.estudiaActualmente
          }
        />
        <Campo
          name="ocupacion"
          etiqueta="Ocupación actual"
          defaultValue={valorDe("ocupacion")}
          errores={estado.errores?.ocupacion}
        />
      </div>

      <div data-paso="2" className={clasesPaso(2)}>
        <Campo
          name="discapacidad"
          etiqueta="Discapacidad, si aplica"
          defaultValue={valorDe("discapacidad")}
          errores={estado.errores?.discapacidad}
        />
        <Campo
          name="enfermedadCronica"
          etiqueta="Enfermedad crónica, si aplica"
          defaultValue={valorDe("enfermedadCronica")}
          errores={estado.errores?.enfermedadCronica}
        />
      </div>

      <AvisoFormulario estado={estado} />

      <div className="flex gap-2">
        {paso > 0 && (
          <Button key="anterior" type="button" variant="outline" size="lg" onClick={() => setPaso(paso - 1)}>
            Anterior
          </Button>
        )}
        {paso < ULTIMO_PASO ? (
          <Button key="siguiente" type="button" size="lg" onClick={siguiente}>
            Siguiente
          </Button>
        ) : (
          <Button key="guardar" type="submit" size="lg" disabled={pendiente}>
            {pendiente ? "Guardando…" : "Guardar"}
          </Button>
        )}
      </div>
    </form>
  );
}

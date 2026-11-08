import type { ComponentProps } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";
import type { EstadoFormulario } from "@/shared/lib/formularios";

function ErroresCampo({ errores }: { errores?: string[] }) {
  return errores?.map((error) => (
    <p key={error} className="text-sm text-destructive">
      {error}
    </p>
  ));
}

type CampoProps = ComponentProps<typeof Input> & {
  name: string;
  etiqueta: string;
  errores?: string[];
};

export function Campo({ name, id = name, etiqueta, errores, ...props }: CampoProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Input
        id={id}
        name={name}
        className="h-10 text-base"
        aria-invalid={errores ? true : undefined}
        {...props}
      />
      <ErroresCampo errores={errores} />
    </div>
  );
}

type CampoTextoProps = ComponentProps<typeof Textarea> & {
  name: string;
  etiqueta: string;
  errores?: string[];
};

export function CampoTexto({ name, etiqueta, errores, ...props }: CampoTextoProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{etiqueta}</Label>
      <Textarea
        id={name}
        name={name}
        className="text-base"
        aria-invalid={errores ? true : undefined}
        {...props}
      />
      <ErroresCampo errores={errores} />
    </div>
  );
}

type CampoSelectProps = {
  name: string;
  etiqueta: string;
  opciones: { valor: string | number; etiqueta: string }[];
  // Texto de una primera opción sin valor, como "Selecciona…" o "Todos".
  vacio?: string;
  defaultValue?: string;
  required?: boolean;
  errores?: string[];
};

export function CampoSelect({
  name,
  etiqueta,
  opciones,
  vacio,
  defaultValue,
  required,
  errores,
}: CampoSelectProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{etiqueta}</Label>
      {/* La key restaura la selección: React la pierde al limpiar el formulario. */}
      <NativeSelect
        key={defaultValue}
        id={name}
        name={name}
        className="w-full [&_select]:h-10 [&_select]:text-base"
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={errores ? true : undefined}
      >
        {vacio && <NativeSelectOption value="">{vacio}</NativeSelectOption>}
        {opciones.map((opcion) => (
          <NativeSelectOption key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <ErroresCampo errores={errores} />
    </div>
  );
}

type CampoCasillaProps = {
  name: string;
  etiqueta: string;
  defaultChecked?: boolean;
};

export function CampoCasilla({ name, etiqueta, defaultChecked }: CampoCasillaProps) {
  return (
    <label className="flex items-center gap-3 text-base">
      <input
        type="checkbox"
        name={name}
        className="size-5 accent-primary"
        defaultChecked={defaultChecked}
      />
      {etiqueta}
    </label>
  );
}

export function AvisoFormulario({ estado }: { estado: EstadoFormulario }) {
  if (estado.error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {estado.error}
      </p>
    );
  }
  if (estado.exito) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {estado.exito}
      </p>
    );
  }
  return null;
}

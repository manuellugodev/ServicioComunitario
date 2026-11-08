import type { ComponentProps } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type CampoProps = ComponentProps<typeof Input> & {
  name: string;
  etiqueta: string;
  errores?: string[];
};

export function Campo({ name, etiqueta, errores, ...props }: CampoProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{etiqueta}</Label>
      <Input
        id={name}
        name={name}
        className="h-10 text-base"
        aria-invalid={errores ? true : undefined}
        {...props}
      />
      {errores?.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {error}
        </p>
      ))}
    </div>
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

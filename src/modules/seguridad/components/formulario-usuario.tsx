"use client";

import { useActionState } from "react";
import { ETIQUETAS_ROL, ROLES } from "@/modules/seguridad/schemas";
import { AvisoFormulario, Campo } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Valores = {
  nombreCompleto: string;
  cedula: string;
  usuario: string;
  rol: string;
};

type Props = {
  accionServidor: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  usuario?: Valores;
};

export function FormularioUsuario({ accionServidor, usuario }: Props) {
  const [estado, accion, pendiente] = useActionState(accionServidor, {});
  const valorDe = (campo: keyof Valores) => estado.valores?.[campo] ?? usuario?.[campo];

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <Campo
        name="nombreCompleto"
        etiqueta="Nombre completo"
        required
        defaultValue={valorDe("nombreCompleto")}
        errores={estado.errores?.nombreCompleto}
      />
      <Campo
        name="cedula"
        etiqueta="Cédula"
        placeholder="V12345678"
        required
        defaultValue={valorDe("cedula")}
        errores={estado.errores?.cedula}
      />
      <Campo
        name="usuario"
        etiqueta="Usuario"
        autoCapitalize="none"
        required
        defaultValue={valorDe("usuario")}
        errores={estado.errores?.usuario}
      />
      {!usuario && (
        <Campo
          name="contrasena"
          etiqueta="Contraseña"
          type="password"
          autoComplete="new-password"
          required
          errores={estado.errores?.contrasena}
        />
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="rol">Rol</Label>
        <NativeSelect id="rol" name="rol" className="w-full" defaultValue={valorDe("rol") ?? "VOCERO"}>
          {ROLES.map((rol) => (
            <NativeSelectOption key={rol} value={rol}>
              {ETIQUETAS_ROL[rol]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {estado.errores?.rol?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}
      </div>
      <AvisoFormulario estado={estado} />
      <Button type="submit" size="lg" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}

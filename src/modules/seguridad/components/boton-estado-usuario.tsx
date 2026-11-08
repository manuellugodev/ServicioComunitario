"use client";

import { cambiarEstadoUsuario } from "@/modules/seguridad/actions";
import { BotonConfirmar } from "@/shared/components/boton-confirmar";

type Props = {
  id: number;
  nombre: string;
  activo: boolean;
};

export function BotonEstadoUsuario({ id, nombre, activo }: Props) {
  const verbo = activo ? "Desactivar" : "Activar";

  return (
    <BotonConfirmar
      etiqueta={`${verbo} usuario`}
      titulo={`¿${verbo} a ${nombre}?`}
      descripcion={
        activo
          ? "No podrá entrar al sistema. Sus registros se conservan y puedes activarlo de nuevo."
          : "Podrá volver a entrar al sistema con su contraseña."
      }
      confirmar={verbo}
      variante={activo ? "destructive" : "outline"}
      accion={() => cambiarEstadoUsuario(id, !activo)}
    />
  );
}

"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoUsuario } from "@/modules/seguridad/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

type Props = {
  id: number;
  nombre: string;
  activo: boolean;
};

export function BotonEstadoUsuario({ id, nombre, activo }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();
  const verbo = activo ? "Desactivar" : "Activar";

  function confirmar() {
    iniciar(async () => {
      const resultado = await cambiarEstadoUsuario(id, !activo);
      setError(resultado.error);
      setAbierto(false);
    });
  }

  return (
    <div className="grid justify-items-start gap-2">
      <AlertDialog open={abierto} onOpenChange={setAbierto}>
        <AlertDialogTrigger render={<Button variant={activo ? "destructive" : "outline"} />}>
          {verbo} usuario
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿{verbo} a {nombre}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activo
                ? "No podrá entrar al sistema. Sus registros se conservan y puedes activarlo de nuevo."
                : "Podrá volver a entrar al sistema con su contraseña."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmar} disabled={pendiente}>
              {verbo}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

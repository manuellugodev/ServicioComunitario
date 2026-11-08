"use client";

import { useState, useTransition } from "react";
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
import type { EstadoFormulario } from "@/shared/lib/formularios";

type Props = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  confirmar: string;
  variante?: "destructive" | "outline";
  tamano?: "default" | "sm";
  accion: () => Promise<EstadoFormulario>;
};

export function BotonConfirmar({
  etiqueta,
  titulo,
  descripcion,
  confirmar,
  variante = "destructive",
  tamano = "default",
  accion,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();

  function ejecutar() {
    iniciar(async () => {
      const resultado = await accion();
      setError(resultado.error);
      setAbierto(false);
    });
  }

  return (
    <div className="grid justify-items-start gap-2">
      <AlertDialog open={abierto} onOpenChange={setAbierto}>
        <AlertDialogTrigger render={<Button variant={variante} size={tamano} />}>
          {etiqueta}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{titulo}</AlertDialogTitle>
            <AlertDialogDescription>{descripcion}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={ejecutar} disabled={pendiente}>
              {confirmar}
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

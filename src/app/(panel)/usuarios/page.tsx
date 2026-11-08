import { Suspense } from "react";
import Link from "next/link";
import { TablaUsuarios } from "@/modules/seguridad/components/tabla-usuarios";
import { Button } from "@/shared/components/ui/button";

export default function PaginaUsuarios() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Usuarios</h1>
        <Button size="lg" render={<Link href="/usuarios/nuevo" />} nativeButton={false}>
          Nuevo usuario
        </Button>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Cargando usuarios…</p>}>
        <TablaUsuarios />
      </Suspense>
    </div>
  );
}

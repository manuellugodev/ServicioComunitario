import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerFamilia } from "@/modules/familias/queries";
import { Dato } from "@/shared/components/dato";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";
import { puedeEscribir } from "@/shared/lib/roles";
import { requerirSesion } from "@/shared/lib/sesion";

const dolares = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });

export async function FichaFamilia({ idTexto }: { idTexto: Promise<string> }) {
  const { rol } = await requerirSesion();
  const id = aIdPositivo(await idTexto);
  const familia = id ? await obtenerFamilia(id) : null;
  if (!familia) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Ficha de familia</h1>
          <Link href={`/viviendas/${familia.vivienda.id}`} className="underline">
            Vivienda {familia.vivienda.codigo}
          </Link>
        </div>
        {puedeEscribir(rol) && (
          <Button
            variant="outline"
            size="lg"
            render={<Link href={`/familias/${familia.id}/editar`} />}
            nativeButton={false}
          >
            Editar
          </Button>
        )}
      </div>
      <dl className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Dato etiqueta="Sector">{familia.vivienda.sector.nombre}</Dato>
        <Dato etiqueta="Dirección">{familia.vivienda.direccion}</Dato>
        <Dato etiqueta="Ingreso mensual aproximado">
          {familia.ingresoAproxUsd ? dolares.format(Number(familia.ingresoAproxUsd)) : "Sin indicar"}
        </Dato>
        <Dato etiqueta="Recibe bolsa CLAP">{familia.recibeClap ? "Sí" : "No"}</Dato>
        <Dato etiqueta="Observaciones">{familia.observaciones ?? "Sin observaciones"}</Dato>
      </dl>
    </div>
  );
}

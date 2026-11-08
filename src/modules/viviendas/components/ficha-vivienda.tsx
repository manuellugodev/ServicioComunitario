import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerVivienda } from "@/modules/viviendas/queries";
import { ETIQUETAS_TENENCIA, SERVICIOS } from "@/modules/viviendas/schemas";
import { Dato } from "@/shared/components/dato";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";

export async function FichaVivienda({ idTexto }: { idTexto: Promise<string> }) {
  const id = aIdPositivo(await idTexto);
  const vivienda = id ? await obtenerVivienda(id) : null;
  if (!vivienda) {
    notFound();
  }

  const servicios = SERVICIOS.filter(({ campo }) => vivienda[campo]).map(({ etiqueta }) => etiqueta);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Vivienda {vivienda.codigo}</h1>
        <Button
          variant="outline"
          size="lg"
          render={<Link href={`/viviendas/${vivienda.id}/editar`} />}
          nativeButton={false}
        >
          Editar
        </Button>
      </div>
      <dl className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Dato etiqueta="Sector">{vivienda.sector.nombre}</Dato>
        <Dato etiqueta="Tipo de vivienda">{vivienda.tipoVivienda.nombre}</Dato>
        <Dato etiqueta="Dirección">{vivienda.direccion}</Dato>
        <Dato etiqueta="Tenencia">
          {vivienda.tenencia ? ETIQUETAS_TENENCIA[vivienda.tenencia] : "Sin indicar"}
        </Dato>
        <Dato etiqueta="Servicios básicos">
          {servicios.length > 0 ? servicios.join(", ") : "Ninguno"}
        </Dato>
        <Dato etiqueta="Observaciones">{vivienda.observaciones ?? "Sin observaciones"}</Dato>
      </dl>
    </div>
  );
}

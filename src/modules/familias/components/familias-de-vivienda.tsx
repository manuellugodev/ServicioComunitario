import Link from "next/link";
import { listarFamiliasDeVivienda } from "@/modules/familias/queries";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";

export async function FamiliasDeVivienda({ idTexto }: { idTexto: Promise<string> }) {
  const viviendaId = aIdPositivo(await idTexto);
  if (!viviendaId) {
    return null;
  }

  const familias = await listarFamiliasDeVivienda(viviendaId);

  return (
    <section className="grid max-w-2xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Núcleos familiares</h2>
        <Button
          size="lg"
          render={<Link href={`/viviendas/${viviendaId}/familias/nueva`} />}
          nativeButton={false}
        >
          Agregar familia
        </Button>
      </div>
      {familias.length === 0 ? (
        <p className="text-muted-foreground">Esta vivienda no tiene familias registradas.</p>
      ) : (
        <ul>
          {familias.map((familia, indice) => (
            <li key={familia.id} className="flex flex-wrap justify-between gap-2 border-b py-2">
              <Link href={`/familias/${familia.id}`} className="font-medium underline">
                Familia {indice + 1}
              </Link>
              {familia.recibeClap && <span className="text-muted-foreground">Recibe CLAP</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

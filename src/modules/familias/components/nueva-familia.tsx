import { notFound } from "next/navigation";
import { crearFamilia } from "@/modules/familias/actions";
import { FormularioFamilia } from "@/modules/familias/components/formulario-familia";
import { obtenerVivienda } from "@/modules/viviendas/queries";
import { aIdPositivo } from "@/shared/lib/acciones";
import { requerirEscritura } from "@/shared/lib/sesion";

export async function NuevaFamilia({ idTexto }: { idTexto: Promise<string> }) {
  await requerirEscritura();

  const viviendaId = aIdPositivo(await idTexto);
  const vivienda = viviendaId ? await obtenerVivienda(viviendaId) : null;
  if (!viviendaId || !vivienda) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">
        Nueva familia en la vivienda {vivienda.codigo}
      </h1>
      <FormularioFamilia accionServidor={crearFamilia.bind(null, viviendaId)} />
    </div>
  );
}

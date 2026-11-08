import { notFound } from "next/navigation";
import { listarSectores, listarTiposVivienda } from "@/modules/configuracion/queries";
import { editarVivienda } from "@/modules/viviendas/actions";
import { FormularioVivienda } from "@/modules/viviendas/components/formulario-vivienda";
import { obtenerVivienda } from "@/modules/viviendas/queries";
import { aIdPositivo } from "@/shared/lib/acciones";
import { requerirEscritura } from "@/shared/lib/sesion";

export async function EditarVivienda({ idTexto }: { idTexto: Promise<string> }) {
  await requerirEscritura();

  const id = aIdPositivo(await idTexto);
  const vivienda = id ? await obtenerVivienda(id) : null;
  if (!id || !vivienda) {
    notFound();
  }

  const [sectores, tipos] = await Promise.all([listarSectores(), listarTiposVivienda()]);

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">Editar vivienda {vivienda.codigo}</h1>
      <FormularioVivienda
        accionServidor={editarVivienda.bind(null, id)}
        sectores={sectores}
        tipos={tipos}
        vivienda={vivienda}
      />
    </div>
  );
}

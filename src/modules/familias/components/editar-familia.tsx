import { notFound } from "next/navigation";
import { editarFamilia } from "@/modules/familias/actions";
import { FormularioFamilia } from "@/modules/familias/components/formulario-familia";
import { obtenerFamilia } from "@/modules/familias/queries";
import { aIdPositivo } from "@/shared/lib/acciones";

export async function EditarFamilia({ idTexto }: { idTexto: Promise<string> }) {
  const id = aIdPositivo(await idTexto);
  const familia = id ? await obtenerFamilia(id) : null;
  if (!id || !familia) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">
        Editar familia de la vivienda {familia.vivienda.codigo}
      </h1>
      <FormularioFamilia accionServidor={editarFamilia.bind(null, id)} familia={familia} />
    </div>
  );
}

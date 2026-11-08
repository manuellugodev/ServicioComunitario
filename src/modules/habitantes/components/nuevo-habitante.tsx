import { notFound } from "next/navigation";
import { obtenerFamilia } from "@/modules/familias/queries";
import { crearHabitante } from "@/modules/habitantes/actions";
import { FormularioHabitante } from "@/modules/habitantes/components/formulario-habitante";
import { familiaTieneJefe } from "@/modules/habitantes/queries";
import { aIdPositivo } from "@/shared/lib/acciones";
import { requerirEscritura } from "@/shared/lib/sesion";

export async function NuevoHabitante({ idTexto }: { idTexto: Promise<string> }) {
  await requerirEscritura();

  const nucleoId = aIdPositivo(await idTexto);
  const familia = nucleoId ? await obtenerFamilia(nucleoId) : null;
  if (!nucleoId || !familia) {
    notFound();
  }

  const tieneJefe = await familiaTieneJefe(nucleoId);

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">
        {tieneJefe ? "Agregar miembro" : "Registrar jefe(a) de familia"}
      </h1>
      <p className="text-muted-foreground">Vivienda {familia.vivienda.codigo}</p>
      <FormularioHabitante
        accionServidor={crearHabitante.bind(null, nucleoId)}
        parentescoInicial={tieneJefe ? undefined : "JEFE"}
      />
    </div>
  );
}

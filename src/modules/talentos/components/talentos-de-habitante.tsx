import { listarCategoriasTalento } from "@/modules/configuracion/queries";
import { AsignacionesTalento } from "@/modules/talentos/components/asignaciones-talento";
import { listarTalentos, listarTalentosDeHabitante } from "@/modules/talentos/queries";
import { aIdPositivo } from "@/shared/lib/acciones";
import { esAdmin, puedeEscribir } from "@/shared/lib/roles";
import { requerirSesion } from "@/shared/lib/sesion";

export async function TalentosDeHabitante({ idTexto }: { idTexto: Promise<string> }) {
  const habitanteId = aIdPositivo(await idTexto);
  if (!habitanteId) {
    return null;
  }

  const { rol } = await requerirSesion();
  const [asignaciones, categorias, talentos] = await Promise.all([
    listarTalentosDeHabitante(habitanteId),
    listarCategoriasTalento(),
    listarTalentos(),
  ]);

  return (
    <AsignacionesTalento
      habitanteId={habitanteId}
      asignaciones={asignaciones}
      categorias={categorias}
      talentos={talentos}
      puedeEditar={puedeEscribir(rol)}
      puedeQuitar={esAdmin(rol)}
    />
  );
}

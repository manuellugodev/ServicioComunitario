import { listarCategoriasTalento } from "@/modules/configuracion/queries";
import { ListaTalentosCatalogo } from "@/modules/talentos/components/lista-talentos-catalogo";
import { listarTalentos } from "@/modules/talentos/queries";
import { requerirAdmin } from "@/shared/lib/sesion";

export async function CatalogoTalentos() {
  await requerirAdmin();

  const [categorias, talentos] = await Promise.all([listarCategoriasTalento(), listarTalentos()]);

  return <ListaTalentosCatalogo categorias={categorias} talentos={talentos} />;
}

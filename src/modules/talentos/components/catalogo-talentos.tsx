import { listarCategoriasTalento } from "@/modules/configuracion/queries";
import { ListaTalentosCatalogo } from "@/modules/talentos/components/lista-talentos-catalogo";
import { listarTalentos } from "@/modules/talentos/queries";

export async function CatalogoTalentos() {
  const [categorias, talentos] = await Promise.all([listarCategoriasTalento(), listarTalentos()]);

  return <ListaTalentosCatalogo categorias={categorias} talentos={talentos} />;
}

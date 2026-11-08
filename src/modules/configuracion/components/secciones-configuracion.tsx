import { FormularioNombreConsejo } from "@/modules/configuracion/components/formulario-nombre-consejo";
import { ListaCatalogo } from "@/modules/configuracion/components/lista-catalogo";
import {
  listarSectores,
  listarTiposVivienda,
  obtenerNombreConsejo,
} from "@/modules/configuracion/queries";

export async function SeccionesConfiguracion() {
  const [nombre, sectores, tipos] = await Promise.all([
    obtenerNombreConsejo(),
    listarSectores(),
    listarTiposVivienda(),
  ]);

  return (
    <div className="grid gap-10">
      <section className="grid gap-4">
        <h2 className="font-heading text-lg font-semibold">Datos del consejo comunal</h2>
        <FormularioNombreConsejo nombre={nombre} />
      </section>
      <ListaCatalogo titulo="Sectores" singular="sector" catalogo="sector" elementos={sectores} />
      <ListaCatalogo
        titulo="Tipos de vivienda"
        singular="tipo de vivienda"
        catalogo="tipo_vivienda"
        elementos={tipos}
      />
    </div>
  );
}

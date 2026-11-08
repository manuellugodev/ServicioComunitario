import { FormularioNombreConsejo } from "@/modules/configuracion/components/formulario-nombre-consejo";
import { ListaCatalogo } from "@/modules/configuracion/components/lista-catalogo";
import {
  listarCategoriasTalento,
  listarSectores,
  listarTiposVivienda,
  obtenerNombreConsejo,
} from "@/modules/configuracion/queries";
import { Button } from "@/shared/components/ui/button";
import { requerirAdmin } from "@/shared/lib/sesion";

export async function SeccionesConfiguracion() {
  await requerirAdmin();

  const [nombre, sectores, tipos, categorias] = await Promise.all([
    obtenerNombreConsejo(),
    listarSectores(),
    listarTiposVivienda(),
    listarCategoriasTalento(),
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
      <ListaCatalogo
        titulo="Categorías de talento"
        singular="categoría"
        catalogo="categoria_talento"
        elementos={categorias}
      />
      <section className="grid max-w-2xl gap-4">
        <h2 className="font-heading text-lg font-semibold">Respaldo de la base de datos</h2>
        <p className="text-muted-foreground">
          Descarga una copia completa. Contiene datos personales: guárdala en un lugar seguro.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="w-fit"
          render={<a href="/configuracion/respaldo" download />}
          nativeButton={false}
        >
          Generar respaldo
        </Button>
      </section>
    </div>
  );
}

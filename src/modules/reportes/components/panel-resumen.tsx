import {
  PiramidePoblacional,
  TalentosPorCategoria,
} from "@/modules/reportes/components/graficos-panel";
import { obtenerResumen } from "@/modules/reportes/queries";

const numero = new Intl.NumberFormat("es-VE");

export async function PanelResumen() {
  const resumen = await obtenerResumen();

  const totales = [
    { etiqueta: "Viviendas", valor: resumen.viviendas },
    { etiqueta: "Familias", valor: resumen.familias },
    { etiqueta: "Habitantes activos", valor: resumen.habitantes },
    { etiqueta: "Talentos registrados", valor: resumen.talentos },
    { etiqueta: "Proyectos en ejecución", valor: resumen.proyectos },
  ];

  return (
    <div className="grid gap-8">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {totales.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="rounded-lg border p-4">
            <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
            <dd className="mt-1 text-3xl font-semibold">{numero.format(valor)}</dd>
          </div>
        ))}
      </dl>
      {resumen.habitantes === 0 ? (
        <p className="text-muted-foreground">
          Los gráficos aparecerán cuando haya habitantes registrados.
        </p>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <PiramidePoblacional datos={resumen.piramide} />
          <TalentosPorCategoria datos={resumen.talentosPorCategoria} />
        </div>
      )}
    </div>
  );
}

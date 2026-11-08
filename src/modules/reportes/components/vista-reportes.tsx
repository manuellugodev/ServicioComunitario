import Form from "next/form";
import Link from "next/link";
import { listarCategoriasTalento, listarSectores } from "@/modules/configuracion/queries";
import { generarReporte, leerFiltros } from "@/modules/reportes/queries";
import { ETAPAS, TIPOS_REPORTE } from "@/modules/reportes/schemas";
import { CampoSelect } from "@/shared/components/campo";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const FILAS_VISTA_PREVIA = 50;

type Props = {
  parametros: Promise<Record<string, string | string[] | undefined>>;
};

export async function VistaReportes({ parametros }: Props) {
  const filtros = leerFiltros(await parametros);
  const { tipo, sectorId, categoriaId, etapa } = filtros;

  const [reporte, sectores, categorias] = await Promise.all([
    generarReporte(filtros),
    listarSectores(),
    listarCategoriasTalento(),
  ]);

  const aOpciones = (lista: { id: number; nombre: string }[]) =>
    lista.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }));

  const consulta = new URLSearchParams({ reporte: tipo });
  if (sectorId) {
    consulta.set("sector", String(sectorId));
  }
  if (tipo === "talentos" && categoriaId) {
    consulta.set("categoria", String(categoriaId));
  }
  if (tipo === "edad-escolar" && etapa) {
    consulta.set("etapa", etapa.id);
  }
  const enlaceExportar = (formato: string) => `/reportes/exportar?formato=${formato}&${consulta}`;

  return (
    <div className="grid gap-6">
      <nav aria-label="Tipo de reporte" className="flex flex-wrap gap-2">
        {TIPOS_REPORTE.map(({ id, titulo }) => (
          <Button
            key={id}
            variant={id === tipo ? "default" : "outline"}
            render={<Link href={`/reportes?reporte=${id}`} aria-current={id === tipo ? "page" : undefined} />}
            nativeButton={false}
          >
            {titulo}
          </Button>
        ))}
      </nav>

      <Form action="/reportes" className="grid max-w-2xl items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="reporte" value={tipo} />
        <CampoSelect
          name="sector"
          etiqueta="Sector"
          opciones={aOpciones(sectores)}
          vacio="Todos"
          defaultValue={sectorId ? String(sectorId) : ""}
        />
        {tipo === "talentos" && (
          <CampoSelect
            name="categoria"
            etiqueta="Área"
            opciones={aOpciones(categorias)}
            vacio="Todas"
            defaultValue={categoriaId ? String(categoriaId) : ""}
          />
        )}
        {tipo === "edad-escolar" && (
          <CampoSelect
            name="etapa"
            etiqueta="Etapa"
            opciones={ETAPAS.map(({ id, etiqueta, minima, maxima }) => ({
              valor: id,
              etiqueta: `${etiqueta} (${minima} a ${maxima} años)`,
            }))}
            vacio="Todas"
            defaultValue={etapa?.id ?? ""}
          />
        )}
        <Button type="submit" variant="outline" size="lg" className="h-10 w-fit">
          Filtrar
        </Button>
      </Form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">
          {reporte.titulo} ({reporte.filas.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            render={<a href={enlaceExportar("pdf")} download />}
            nativeButton={false}
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="lg"
            render={<a href={enlaceExportar("xlsx")} download />}
            nativeButton={false}
          >
            Excel
          </Button>
        </div>
      </div>

      {reporte.filas.length === 0 ? (
        <p className="text-muted-foreground">No hay registros con esos filtros.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {reporte.columnas.map((columna) => (
                  <TableHead key={columna}>{columna}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reporte.filas.slice(0, FILAS_VISTA_PREVIA).map((fila, indice) => (
                <TableRow key={indice}>
                  {fila.map((celda, columna) => (
                    <TableCell key={columna}>{celda}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {reporte.filas.length > FILAS_VISTA_PREVIA && (
            <p className="text-sm text-muted-foreground">
              Vista previa de {FILAS_VISTA_PREVIA} de {reporte.filas.length} registros. El archivo
              exportado los incluye todos.
            </p>
          )}
        </>
      )}
    </div>
  );
}

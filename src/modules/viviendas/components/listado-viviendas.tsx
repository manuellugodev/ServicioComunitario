import Form from "next/form";
import Link from "next/link";
import { listarSectores } from "@/modules/configuracion/queries";
import { listarViviendas } from "@/modules/viviendas/queries";
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
import { aIdPositivo } from "@/shared/lib/acciones";

type Props = {
  parametros: Promise<Record<string, string | string[] | undefined>>;
};

export async function ListadoViviendas({ parametros }: Props) {
  const { sector, pagina: paginaTexto } = await parametros;
  const sectorId = aIdPositivo(sector) ?? undefined;

  const [{ viviendas, total, pagina, paginas }, sectores] = await Promise.all([
    listarViviendas({ sectorId, pagina: aIdPositivo(paginaTexto) ?? 1 }),
    listarSectores(),
  ]);

  const enlacePagina = (numero: number) => {
    const consulta = new URLSearchParams({ pagina: String(numero) });
    if (sectorId) {
      consulta.set("sector", String(sectorId));
    }
    return `/viviendas?${consulta}`;
  };

  return (
    <div className="grid gap-4">
      <Form action="/viviendas" className="flex flex-wrap items-end gap-2">
        <div className="w-full max-w-xs">
          <CampoSelect
            name="sector"
            etiqueta="Sector"
            opciones={sectores.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }))}
            vacio="Todos"
            defaultValue={sectorId ? String(sectorId) : ""}
          />
        </div>
        <Button type="submit" variant="outline" size="lg">
          Filtrar
        </Button>
      </Form>

      {viviendas.length === 0 ? (
        <p className="text-muted-foreground">No hay viviendas registradas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="hidden sm:table-cell">Dirección</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viviendas.map((vivienda) => (
              <TableRow key={vivienda.id}>
                <TableCell>
                  <Link href={`/viviendas/${vivienda.id}`} className="font-medium underline">
                    {vivienda.codigo}
                  </Link>
                </TableCell>
                <TableCell>{vivienda.sector.nombre}</TableCell>
                <TableCell className="hidden whitespace-normal sm:table-cell">
                  {vivienda.direccion}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{vivienda.tipoVivienda.nombre}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "vivienda" : "viviendas"} · Página {pagina} de {paginas}
        </p>
        {pagina > 1 && (
          <Link href={enlacePagina(pagina - 1)} className="text-sm underline">
            Anterior
          </Link>
        )}
        {pagina < paginas && (
          <Link href={enlacePagina(pagina + 1)} className="text-sm underline">
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}

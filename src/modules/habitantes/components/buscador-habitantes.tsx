import Form from "next/form";
import Link from "next/link";
import { listarSectores } from "@/modules/configuracion/queries";
import { buscarHabitantes } from "@/modules/habitantes/queries";
import { ESTADOS, ETIQUETAS_ESTADO, esquemaEstado, formatoCedula } from "@/modules/habitantes/schemas";
import { Campo, CampoSelect } from "@/shared/components/campo";
import { Paginacion } from "@/shared/components/paginacion";
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
import { calcularEdad } from "@/shared/lib/fechas";

const TODOS = "TODOS";

type Props = {
  parametros: Promise<Record<string, string | string[] | undefined>>;
};

export async function BuscadorHabitantes({ parametros }: Props) {
  const { q, sector, estado: estadoTexto, pagina: paginaTexto } = await parametros;
  const texto = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const sectorId = aIdPositivo(sector) ?? undefined;
  const verTodos = estadoTexto === TODOS;
  const estado = verTodos ? undefined : (esquemaEstado.safeParse(estadoTexto).data ?? "ACTIVO");

  const [{ habitantes, total, pagina, paginas }, sectores] = await Promise.all([
    buscarHabitantes({ texto, sectorId, estado, pagina: aIdPositivo(paginaTexto) ?? 1 }),
    listarSectores(),
  ]);

  return (
    <div className="grid gap-4">
      <Form action="/habitantes" className="grid max-w-3xl items-end gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <Campo
          name="q"
          etiqueta="Cédula, nombre o código de vivienda"
          type="search"
          defaultValue={texto}
        />
        <CampoSelect
          name="sector"
          etiqueta="Sector"
          opciones={sectores.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }))}
          vacio="Todos"
          defaultValue={sectorId ? String(sectorId) : ""}
        />
        <CampoSelect
          name="estado"
          etiqueta="Estado"
          opciones={[
            ...ESTADOS.map((valor) => ({ valor, etiqueta: ETIQUETAS_ESTADO[valor] })),
            { valor: TODOS, etiqueta: "Todos" },
          ]}
          defaultValue={estado ?? TODOS}
        />
        <Button type="submit" variant="outline" size="lg" className="h-10 w-fit">
          Buscar
        </Button>
      </Form>

      {habitantes.length === 0 ? (
        <p className="text-muted-foreground">No se encontraron personas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Cédula</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead className="hidden sm:table-cell">Sector</TableHead>
              <TableHead className="hidden sm:table-cell">Vivienda</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {habitantes.map((habitante) => (
              <TableRow key={habitante.id}>
                <TableCell className="whitespace-normal">
                  <Link href={`/habitantes/${habitante.id}`} className="font-medium underline">
                    {habitante.apellidos}, {habitante.nombres}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatoCedula(habitante.nacionalidad, habitante.cedula)}
                </TableCell>
                <TableCell>{calcularEdad(habitante.fechaNacimiento)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {habitante.nucleo.vivienda.sector.nombre}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {habitante.nucleo.vivienda.codigo}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {ETIQUETAS_ESTADO[habitante.estado]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Paginacion
        ruta="/habitantes"
        consulta={{
          q: texto || undefined,
          sector: sectorId ? String(sectorId) : undefined,
          estado: estado ?? TODOS,
        }}
        texto={`${total} ${total === 1 ? "persona" : "personas"}`}
        pagina={pagina}
        paginas={paginas}
      />
    </div>
  );
}

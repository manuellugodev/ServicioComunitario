import Form from "next/form";
import Link from "next/link";
import { listarCategoriasTalento, listarSectores } from "@/modules/configuracion/queries";
import { buscarVecinosPorTalento, listarTalentos } from "@/modules/talentos/queries";
import { ETIQUETAS_NIVEL_TALENTO, NIVELES, esquemaNivel } from "@/modules/talentos/schemas";
import { CampoSelect } from "@/shared/components/campo";
import { Paginacion } from "@/shared/components/paginacion";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";

const SI = "si";
const NO = "no";

type Props = {
  parametros: Promise<Record<string, string | string[] | undefined>>;
};

export async function BuscadorTalentos({ parametros }: Props) {
  const consulta = await parametros;
  const categoriaId = aIdPositivo(consulta.categoria) ?? undefined;
  const talentoId = aIdPositivo(consulta.talento) ?? undefined;
  const sectorId = aIdPositivo(consulta.sector) ?? undefined;
  const nivel = esquemaNivel.safeParse(consulta.nivel).data;
  const disponibilidad = consulta.disponible === SI || consulta.disponible === NO ? consulta.disponible : undefined;

  const [{ resultados, total, pagina, paginas }, categorias, talentos, sectores] = await Promise.all([
    buscarVecinosPorTalento({
      categoriaId,
      talentoId,
      sectorId,
      nivel,
      disponible: disponibilidad && disponibilidad === SI,
      pagina: aIdPositivo(consulta.pagina) ?? 1,
    }),
    listarCategoriasTalento(),
    listarTalentos(),
    listarSectores(),
  ]);

  const aOpciones = (lista: { id: number; nombre: string }[]) =>
    lista.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }));

  const talentosDeCategoria = categoriaId
    ? talentos.filter((talento) => talento.categoriaId === categoriaId)
    : talentos;

  return (
    <div className="grid gap-4">
      <Form action="/talentos" className="grid max-w-3xl items-end gap-3 sm:grid-cols-3">
        <CampoSelect
          name="categoria"
          etiqueta="Categoría"
          opciones={aOpciones(categorias)}
          vacio="Todas"
          defaultValue={categoriaId ? String(categoriaId) : ""}
        />
        <CampoSelect
          name="talento"
          etiqueta="Talento"
          opciones={aOpciones(talentosDeCategoria)}
          vacio="Todos"
          defaultValue={talentoId ? String(talentoId) : ""}
        />
        <CampoSelect
          name="sector"
          etiqueta="Sector"
          opciones={aOpciones(sectores)}
          vacio="Todos"
          defaultValue={sectorId ? String(sectorId) : ""}
        />
        <CampoSelect
          name="nivel"
          etiqueta="Nivel"
          opciones={NIVELES.map((valor) => ({ valor, etiqueta: ETIQUETAS_NIVEL_TALENTO[valor] }))}
          vacio="Todos"
          defaultValue={nivel ?? ""}
        />
        <CampoSelect
          name="disponible"
          etiqueta="Disponibilidad"
          opciones={[
            { valor: SI, etiqueta: "Disponibles" },
            { valor: NO, etiqueta: "No disponibles" },
          ]}
          vacio="Todos"
          defaultValue={disponibilidad ?? ""}
        />
        <Button type="submit" variant="outline" size="lg" className="h-10 w-fit">
          Buscar
        </Button>
      </Form>

      {resultados.length === 0 ? (
        <p className="text-muted-foreground">No se encontraron vecinos con esos filtros.</p>
      ) : (
        <ul className="max-w-3xl">
          {resultados.map((resultado) => {
            const { habitante, talento } = resultado;
            const { vivienda } = habitante.nucleo;

            return (
              <li key={`${resultado.habitanteId}-${resultado.talentoId}`} className="grid gap-0.5 border-b py-3">
                <p>
                  <Link href={`/habitantes/${resultado.habitanteId}`} className="font-medium underline">
                    {habitante.apellidos}, {habitante.nombres}
                  </Link>{" "}
                  · {talento.nombre}{" "}
                  <span className="text-muted-foreground">({talento.categoria.nombre})</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {ETIQUETAS_NIVEL_TALENTO[resultado.nivel]} · {resultado.aniosExperiencia} años de experiencia
                  {resultado.certificado && " · Certificado"} ·{" "}
                  {resultado.disponible ? "Disponible" : "No disponible"}
                </p>
                <p className="text-sm">
                  {habitante.telefono ? (
                    <a href={`tel:${habitante.telefono.replace(/[^\d+]/g, "")}`} className="underline">
                      {habitante.telefono}
                    </a>
                  ) : (
                    "Sin teléfono"
                  )}{" "}
                  · {vivienda.sector.nombre} · {vivienda.direccion}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <Paginacion
        ruta="/talentos"
        consulta={{
          categoria: categoriaId ? String(categoriaId) : undefined,
          talento: talentoId ? String(talentoId) : undefined,
          sector: sectorId ? String(sectorId) : undefined,
          nivel,
          disponible: disponibilidad,
        }}
        texto={`${total} ${total === 1 ? "resultado" : "resultados"}`}
        pagina={pagina}
        paginas={paginas}
      />
    </div>
  );
}

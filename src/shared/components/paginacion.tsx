import Link from "next/link";

type Props = {
  ruta: string;
  consulta: Record<string, string | undefined>;
  texto: string;
  pagina: number;
  paginas: number;
};

export function Paginacion({ ruta, consulta, texto, pagina, paginas }: Props) {
  const enlace = (numero: number) => {
    const parametros = new URLSearchParams({ pagina: String(numero) });
    for (const [clave, valor] of Object.entries(consulta)) {
      if (valor) {
        parametros.set(clave, valor);
      }
    }
    return `${ruta}?${parametros}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-muted-foreground">
        {texto} · Página {pagina} de {paginas}
      </p>
      {pagina > 1 && (
        <Link href={enlace(pagina - 1)} className="text-sm underline">
          Anterior
        </Link>
      )}
      {pagina < paginas && (
        <Link href={enlace(pagina + 1)} className="text-sm underline">
          Siguiente
        </Link>
      )}
    </div>
  );
}

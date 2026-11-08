import Link from "next/link";
import { listarMiembros } from "@/modules/habitantes/queries";
import { ETIQUETAS_ESTADO, ETIQUETAS_PARENTESCO } from "@/modules/habitantes/schemas";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";
import { calcularEdad } from "@/shared/lib/fechas";
import { puedeEscribir } from "@/shared/lib/roles";
import { requerirSesion } from "@/shared/lib/sesion";

export async function MiembrosDeFamilia({ idTexto }: { idTexto: Promise<string> }) {
  const nucleoId = aIdPositivo(await idTexto);
  if (!nucleoId) {
    return null;
  }

  const { rol } = await requerirSesion();
  const miembros = await listarMiembros(nucleoId);
  const tieneJefe = miembros.some(
    ({ parentesco, estado }) => parentesco === "JEFE" && estado === "ACTIVO"
  );

  return (
    <section className="grid max-w-2xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Miembros</h2>
        {puedeEscribir(rol) && (
          <Button
            size="lg"
            render={<Link href={`/familias/${nucleoId}/miembros/nuevo`} />}
            nativeButton={false}
          >
            Agregar miembro
          </Button>
        )}
      </div>
      {!tieneJefe && (
        <p role="status" className="text-sm text-destructive">
          Esta familia todavía no tiene un jefe(a) activo.
        </p>
      )}
      {miembros.length > 0 && (
        <ul>
          {miembros.map((miembro) => (
            <li key={miembro.id} className="flex flex-wrap justify-between gap-2 border-b py-2">
              <Link href={`/habitantes/${miembro.id}`} className="font-medium underline">
                {miembro.nombres} {miembro.apellidos}
              </Link>
              <span className="text-muted-foreground">
                {ETIQUETAS_PARENTESCO[miembro.parentesco]} · {calcularEdad(miembro.fechaNacimiento)} años
                {miembro.estado !== "ACTIVO" && ` · ${ETIQUETAS_ESTADO[miembro.estado]}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

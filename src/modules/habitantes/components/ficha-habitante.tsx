import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonesEstadoHabitante } from "@/modules/habitantes/components/botones-estado-habitante";
import { obtenerHabitante } from "@/modules/habitantes/queries";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_NIVEL,
  ETIQUETAS_PARENTESCO,
  ETIQUETAS_SEXO,
  formatoCedula,
} from "@/modules/habitantes/schemas";
import { Dato } from "@/shared/components/dato";
import { Button } from "@/shared/components/ui/button";
import { aIdPositivo } from "@/shared/lib/acciones";
import { aTextoFecha, calcularEdad } from "@/shared/lib/fechas";

const SIN_INDICAR = "Sin indicar";

export async function FichaHabitante({ idTexto }: { idTexto: Promise<string> }) {
  const id = aIdPositivo(await idTexto);
  const habitante = id ? await obtenerHabitante(id) : null;
  if (!habitante) {
    notFound();
  }

  const nombre = `${habitante.nombres} ${habitante.apellidos}`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{nombre}</h1>
          <Link href={`/familias/${habitante.nucleo.id}`} className="underline">
            Ver familia
          </Link>
          {" · "}
          <Link href={`/viviendas/${habitante.nucleo.vivienda.id}`} className="underline">
            Vivienda {habitante.nucleo.vivienda.codigo}
          </Link>
        </div>
        <Button
          variant="outline"
          size="lg"
          render={<Link href={`/habitantes/${habitante.id}/editar`} />}
          nativeButton={false}
        >
          Editar
        </Button>
      </div>
      <dl className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Dato etiqueta="Cédula">{formatoCedula(habitante.nacionalidad, habitante.cedula)}</Dato>
        <Dato etiqueta="Edad">{calcularEdad(habitante.fechaNacimiento)} años</Dato>
        <Dato etiqueta="Fecha de nacimiento">{aTextoFecha(habitante.fechaNacimiento)}</Dato>
        <Dato etiqueta="Sexo">{ETIQUETAS_SEXO[habitante.sexo]}</Dato>
        <Dato etiqueta="Parentesco">{ETIQUETAS_PARENTESCO[habitante.parentesco]}</Dato>
        <Dato etiqueta="Estado">{ETIQUETAS_ESTADO[habitante.estado]}</Dato>
        <Dato etiqueta="Sector">{habitante.nucleo.vivienda.sector.nombre}</Dato>
        <Dato etiqueta="Teléfono">{habitante.telefono ?? SIN_INDICAR}</Dato>
        <Dato etiqueta="Correo">{habitante.correo ?? SIN_INDICAR}</Dato>
        <Dato etiqueta="Nivel educativo">
          {habitante.nivelEducativo ? ETIQUETAS_NIVEL[habitante.nivelEducativo] : SIN_INDICAR}
        </Dato>
        <Dato etiqueta="Estudia actualmente">{habitante.estudiaActualmente ? "Sí" : "No"}</Dato>
        <Dato etiqueta="Ocupación">{habitante.ocupacion ?? SIN_INDICAR}</Dato>
        <Dato etiqueta="Discapacidad">{habitante.discapacidad ?? "No registra"}</Dato>
        <Dato etiqueta="Enfermedad crónica">{habitante.enfermedadCronica ?? "No registra"}</Dato>
      </dl>
      <BotonesEstadoHabitante id={habitante.id} nombre={nombre} estado={habitante.estado} />
    </div>
  );
}

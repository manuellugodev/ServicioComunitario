import { notFound } from "next/navigation";
import { editarHabitante } from "@/modules/habitantes/actions";
import { FormularioHabitante } from "@/modules/habitantes/components/formulario-habitante";
import { obtenerHabitante } from "@/modules/habitantes/queries";
import { aIdPositivo } from "@/shared/lib/acciones";
import { aTextoFecha } from "@/shared/lib/fechas";
import { requerirEscritura } from "@/shared/lib/sesion";

export async function EditarHabitante({ idTexto }: { idTexto: Promise<string> }) {
  await requerirEscritura();

  const id = aIdPositivo(await idTexto);
  const habitante = id ? await obtenerHabitante(id) : null;
  if (!id || !habitante) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-semibold">
        Editar a {habitante.nombres} {habitante.apellidos}
      </h1>
      <FormularioHabitante
        accionServidor={editarHabitante.bind(null, id)}
        habitante={{
          nombres: habitante.nombres,
          apellidos: habitante.apellidos,
          nacionalidad: habitante.nacionalidad,
          cedula: habitante.cedula,
          fechaNacimiento: aTextoFecha(habitante.fechaNacimiento),
          sexo: habitante.sexo,
          parentesco: habitante.parentesco,
          telefono: habitante.telefono,
          correo: habitante.correo,
          nivelEducativo: habitante.nivelEducativo,
          estudiaActualmente: habitante.estudiaActualmente,
          ocupacion: habitante.ocupacion,
          discapacidad: habitante.discapacidad,
          enfermedadCronica: habitante.enfermedadCronica,
        }}
      />
    </div>
  );
}

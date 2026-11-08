import { z } from "zod";
import { casilla } from "@/shared/lib/esquemas";
import { calcularEdad, hoyEnCaracas } from "@/shared/lib/fechas";

export const NACIONALIDADES = ["V", "E"] as const;
export const SEXOS = ["F", "M"] as const;
export const PARENTESCOS = [
  "JEFE",
  "CONYUGE",
  "HIJO",
  "PADRE_MADRE",
  "HERMANO",
  "NIETO",
  "OTRO",
] as const;
export const NIVELES_EDUCATIVOS = [
  "SIN_ESCOLARIDAD",
  "PRIMARIA",
  "BACHILLERATO",
  "TSU",
  "UNIVERSITARIO",
  "POSTGRADO",
] as const;
export const ESTADOS = ["ACTIVO", "MUDADO", "FALLECIDO"] as const;

export const ETIQUETAS_NACIONALIDAD: Record<(typeof NACIONALIDADES)[number], string> = {
  V: "Venezolana (V)",
  E: "Extranjera (E)",
};
export const ETIQUETAS_SEXO: Record<(typeof SEXOS)[number], string> = {
  F: "Femenino",
  M: "Masculino",
};
export const ETIQUETAS_PARENTESCO: Record<(typeof PARENTESCOS)[number], string> = {
  JEFE: "Jefe(a) de familia",
  CONYUGE: "Cónyuge",
  HIJO: "Hijo(a)",
  PADRE_MADRE: "Padre o madre",
  HERMANO: "Hermano(a)",
  NIETO: "Nieto(a)",
  OTRO: "Otro",
};
export const ETIQUETAS_NIVEL: Record<(typeof NIVELES_EDUCATIVOS)[number], string> = {
  SIN_ESCOLARIDAD: "Sin escolaridad",
  PRIMARIA: "Primaria",
  BACHILLERATO: "Bachillerato",
  TSU: "TSU",
  UNIVERSITARIO: "Universitario",
  POSTGRADO: "Postgrado",
};
export const ETIQUETAS_ESTADO: Record<(typeof ESTADOS)[number], string> = {
  ACTIVO: "Activo",
  MUDADO: "Mudado",
  FALLECIDO: "Fallecido",
};

export const MAYORIA_DE_EDAD = 18;

export const esquemaEstado = z.enum(ESTADOS);

export function formatoCedula(nacionalidad: string, cedula: string | null) {
  return cedula ? `${nacionalidad}-${cedula}` : "Sin cédula";
}

const nombre = (etiqueta: string) =>
  z
    .string()
    .trim()
    .min(2, `Escribe ${etiqueta}.`)
    .max(80, `No puede tener más de 80 caracteres.`);

const textoOpcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `No puede tener más de ${maximo} caracteres.`)
    .transform((valor) => valor || null);

export const esquemaHabitante = z
  .object({
    nombres: nombre("los nombres"),
    apellidos: nombre("los apellidos"),
    nacionalidad: z.enum(NACIONALIDADES, "Selecciona la nacionalidad."),
    cedula: z
      .string()
      .trim()
      .transform((valor) => valor.replace(/[\s.-]/g, "").replace(/^[VE]/i, ""))
      .pipe(z.string().regex(/^(\d{5,9})?$/, "Escribe solo los números de la cédula."))
      .transform((valor) => valor || null),
    fechaNacimiento: z.string("Escribe la fecha de nacimiento.").transform((valor, contexto) => {
      const fecha = new Date(`${valor}T00:00:00.000Z`);
      const valida =
        /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
        !Number.isNaN(fecha.getTime()) &&
        fecha.toISOString().startsWith(valor) &&
        valor >= "1900-01-01" &&
        valor <= hoyEnCaracas();
      if (!valida) {
        contexto.addIssue({ code: "custom", message: "Escribe una fecha de nacimiento válida." });
        return z.NEVER;
      }
      return fecha;
    }),
    sexo: z.enum(SEXOS, "Selecciona el sexo."),
    parentesco: z.enum(PARENTESCOS, "Selecciona el parentesco."),
    telefono: z
      .string()
      .trim()
      .regex(/^[\d\s+()-]{0,20}$/, "Escribe un teléfono válido.")
      .transform((valor) => valor || null),
    correo: z.union(
      [
        z.literal("").transform(() => null),
        z.email("Escribe un correo válido.").trim().max(120, "El correo es demasiado largo."),
      ],
      "Escribe un correo válido."
    ),
    nivelEducativo: z.preprocess(
      (valor) => (valor === "" ? null : valor),
      z.enum(NIVELES_EDUCATIVOS, "Selecciona un nivel educativo válido.").nullable()
    ),
    estudiaActualmente: casilla,
    ocupacion: textoOpcional(80),
    discapacidad: textoOpcional(80),
    enfermedadCronica: textoOpcional(80),
  })
  .superRefine((datos, contexto) => {
    if (!datos.cedula && calcularEdad(datos.fechaNacimiento) >= MAYORIA_DE_EDAD) {
      contexto.addIssue({
        code: "custom",
        path: ["cedula"],
        message: "Las personas mayores de edad deben tener cédula.",
      });
    }
  });

import { z } from "zod";

export const ROLES = ["ADMIN", "VOCERO", "CONSULTA"] as const;

export const ETIQUETAS_ROL: Record<(typeof ROLES)[number], string> = {
  ADMIN: "Administrador",
  VOCERO: "Vocero",
  CONSULTA: "Consulta",
};

// bcrypt solo toma en cuenta los primeros 72 bytes.
const contrasena = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .refine((valor) => new TextEncoder().encode(valor).length <= 72, "La contraseña es demasiado larga.");

const usuario = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "El usuario debe tener al menos 3 caracteres.")
  .max(40, "El usuario no puede tener más de 40 caracteres.")
  .regex(/^[a-z0-9._-]+$/, "Usa solo letras sin acentos, números, punto, guion o guion bajo.");

const datosUsuario = {
  nombreCompleto: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo.")
    .max(120, "El nombre no puede tener más de 120 caracteres."),
  cedula: z
    .string()
    .trim()
    .toUpperCase()
    .transform((valor) => valor.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^[VE]\d{5,9}$/, "Escribe V o E seguida de los números, por ejemplo V12345678.")),
  usuario,
  rol: z.enum(ROLES, "Selecciona un rol."),
};

export const esquemaInicioSesion = z.object({
  usuario: z.string().trim().toLowerCase().min(1, "Escribe tu usuario."),
  contrasena: z.string().min(1, "Escribe tu contraseña."),
});

export const esquemaCrearUsuario = z.object({ ...datosUsuario, contrasena });

export const esquemaEditarUsuario = z.object(datosUsuario);

export const esquemaRestablecerContrasena = z.object({ contrasena });

export const esquemaCambiarContrasena = z
  .object({
    actual: z.string().min(1, "Escribe tu contraseña actual."),
    nueva: contrasena,
    confirmacion: z.string(),
  })
  .refine((datos) => datos.nueva === datos.confirmacion, {
    path: ["confirmacion"],
    message: "Las contraseñas no coinciden.",
  });

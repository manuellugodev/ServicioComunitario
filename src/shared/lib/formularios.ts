export type EstadoFormulario = {
  error?: string;
  exito?: string;
  errores?: Record<string, string[] | undefined>;
  // React limpia el formulario al enviarlo; esto conserva lo escrito si hay errores.
  valores?: Record<string, string>;
};

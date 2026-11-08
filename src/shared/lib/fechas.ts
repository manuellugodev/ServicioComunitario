// El servidor puede estar en UTC, pero la edad se calcula con la fecha de Venezuela.
export function hoyEnCaracas() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas" }).format(new Date());
}

export function aTextoFecha(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

export function calcularEdad(fechaNacimiento: Date) {
  const [anioHoy, mesHoy, diaHoy] = hoyEnCaracas().split("-").map(Number);
  const [anio, mes, dia] = aTextoFecha(fechaNacimiento).split("-").map(Number);
  const yaCumplio = mesHoy > mes || (mesHoy === mes && diaHoy >= dia);
  return anioHoy - anio - (yaCumplio ? 0 : 1);
}

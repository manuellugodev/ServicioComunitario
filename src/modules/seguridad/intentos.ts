import "server-only";

const MAXIMO_FALLOS = 10;
const BLOQUEO_MS = 15 * 60 * 1000;
const MAXIMO_REGISTROS = 1000;

// En memoria: basta para un solo servidor y un reinicio solo borra los contadores.
const intentos = new Map<string, { fallos: number; hasta: number }>();

function borrarVencidos() {
  const ahora = Date.now();
  for (const [usuario, { hasta }] of intentos) {
    if (ahora >= hasta) {
      intentos.delete(usuario);
    }
  }
}

export function estaBloqueado(usuario: string) {
  const intento = intentos.get(usuario);
  if (!intento) {
    return false;
  }
  if (Date.now() >= intento.hasta) {
    intentos.delete(usuario);
    return false;
  }
  return intento.fallos >= MAXIMO_FALLOS;
}

export function registrarFallo(usuario: string) {
  if (intentos.size >= MAXIMO_REGISTROS) {
    borrarVencidos();
  }
  const fallos = (intentos.get(usuario)?.fallos ?? 0) + 1;
  intentos.set(usuario, { fallos, hasta: Date.now() + BLOQUEO_MS });
}

export function limpiarFallos(usuario: string) {
  intentos.delete(usuario);
}

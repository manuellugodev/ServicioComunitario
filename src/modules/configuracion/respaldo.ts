import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);
const TAMANO_MAXIMO = 500 * 1024 * 1024;

export async function generarRespaldo() {
  const conexion = new URL(process.env.DATABASE_URL!);

  // La contraseña va en el entorno para que no aparezca en la lista de procesos.
  const { stdout } = await ejecutar(
    process.env.PG_DUMP_PATH || "pg_dump",
    ["--format=custom", "--no-owner", "--no-privileges"],
    {
      encoding: "buffer",
      maxBuffer: TAMANO_MAXIMO,
      env: {
        ...process.env,
        PGHOST: conexion.hostname,
        PGPORT: conexion.port || "5432",
        PGUSER: decodeURIComponent(conexion.username),
        PGPASSWORD: decodeURIComponent(conexion.password),
        PGDATABASE: conexion.pathname.slice(1),
      },
    }
  );

  return new Uint8Array(stdout);
}

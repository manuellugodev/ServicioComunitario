import Link from "next/link";
import { listarSectores, listarTiposVivienda } from "@/modules/configuracion/queries";
import { crearVivienda } from "@/modules/viviendas/actions";
import { FormularioVivienda } from "@/modules/viviendas/components/formulario-vivienda";

export async function NuevaVivienda() {
  const [sectores, tipos] = await Promise.all([listarSectores(), listarTiposVivienda()]);

  if (sectores.length === 0) {
    return (
      <p className="text-muted-foreground">
        Primero registra al menos un sector en{" "}
        <Link href="/configuracion" className="underline">
          Configuración
        </Link>
        .
      </p>
    );
  }

  return <FormularioVivienda accionServidor={crearVivienda} sectores={sectores} tipos={tipos} />;
}

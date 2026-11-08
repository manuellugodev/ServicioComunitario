import Link from "next/link";
import { listarUsuarios } from "@/modules/seguridad/queries";
import { ETIQUETAS_ROL } from "@/modules/seguridad/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export async function TablaUsuarios() {
  const usuarios = await listarUsuarios();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead className="hidden sm:table-cell">Cédula</TableHead>
          <TableHead className="hidden sm:table-cell">Usuario</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell>
              <Link href={`/usuarios/${usuario.id}`} className="font-medium underline">
                {usuario.nombreCompleto}
              </Link>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{usuario.cedula}</TableCell>
            <TableCell className="hidden sm:table-cell">{usuario.usuario}</TableCell>
            <TableCell>{ETIQUETAS_ROL[usuario.rol]}</TableCell>
            <TableCell>{usuario.activo ? "Activo" : "Inactivo"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

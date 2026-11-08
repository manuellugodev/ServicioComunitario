"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Navegacion } from "@/shared/components/navegacion";
import type { Rol } from "@/shared/lib/roles";

type Props = {
  titulo: ReactNode;
  rol: Rol;
  children: ReactNode;
};

export function MenuMovil({ titulo, rol, children }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{titulo}</SheetTitle>
        </SheetHeader>
        <Navegacion rol={rol} alNavegar={() => setAbierto(false)} />
        <div className="mt-auto border-t" onClick={() => setAbierto(false)}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

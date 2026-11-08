"use client";

import { useState } from "react";
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

export function MenuMovil({ nombreConsejo }: { nombreConsejo: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{nombreConsejo}</SheetTitle>
        </SheetHeader>
        <Navegacion alNavegar={() => setAbierto(false)} />
      </SheetContent>
    </Sheet>
  );
}

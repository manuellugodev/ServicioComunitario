import type { ReactNode } from "react";

export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="whitespace-pre-line">{children}</dd>
    </div>
  );
}

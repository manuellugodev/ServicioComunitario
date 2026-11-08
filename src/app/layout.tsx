import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Censo y Talentos Vecinales",
  description: "Censo demográfico y gestión de talentos vecinales del consejo comunal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

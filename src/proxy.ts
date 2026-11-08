import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/cookie-sesion";

// Revisión rápida para redirigir; la verificación real está en requerirSesion().
export function proxy(request: NextRequest) {
  if (!request.cookies.has(COOKIE_SESION)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon\\.ico).*)"],
};

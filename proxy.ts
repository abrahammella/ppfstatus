import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession, type SessionPayload } from "@/lib/auth/jwt";
import type { Role } from "@/lib/flow/ppf-stages";

const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard",
  tecnico: "/tecnico",
  especialista: "/especialista",
  qc: "/qc",
};

const ADMIN_PREFIXES = [
  "/dashboard",
  "/tablero",
  "/tickets",
  "/clientes",
  "/servicios",
  "/catalogo",
  "/empleados",
];
const ROLE_PREFIXES: Record<Role, string[]> = {
  admin: ADMIN_PREFIXES,
  tecnico: ["/tecnico", "/ticket"],
  especialista: ["/especialista", "/ticket"],
  qc: ["/qc", "/ticket"],
};

const PUBLIC_PATHS = ["/login", "/status"];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static and Next internals — let through.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads") ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let session: SessionPayload | null = null;
  if (token) session = await verifySession(token);

  // Public — anyone may visit; redirect logged-in users away from /login.
  if (startsWithAny(pathname, PUBLIC_PATHS)) {
    if (pathname === "/login" && session) {
      return NextResponse.redirect(new URL(ROLE_HOME[session.role], req.url));
    }
    return NextResponse.next();
  }

  // Anything else needs a session.
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Per-role authorization (optimistic check; server actions enforce again).
  const allowed = ROLE_PREFIXES[session.role];
  if (!startsWithAny(pathname, allowed) && pathname !== "/") {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/status|_next/static|_next/image|uploads|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};

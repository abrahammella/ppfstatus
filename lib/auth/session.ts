import "server-only";
import { cookies } from "next/headers";
import type { Role } from "@/lib/flow/ppf-stages";
import { COOKIE_NAME, EXPIRES_IN_S, type SessionPayload, verifySession } from "./jwt";

export type { SessionPayload };
export { COOKIE_NAME };

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRES_IN_S,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export async function requireRole(...allowed: Role[]): Promise<SessionPayload> {
  const s = await requireSession();
  if (!allowed.includes(s.role)) throw new Error("FORBIDDEN");
  return s;
}

import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/flow/ppf-stages";

export const COOKIE_NAME = "ppf_session";
const ALG = "HS256";
export const EXPIRES_IN_S = 60 * 60 * 8; // 8 horas

export interface SessionPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("AUTH_SECRET no está configurado o es demasiado corto.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN_S}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email as string,
      role: payload.role as Role,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

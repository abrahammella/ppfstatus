import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const s = process.env.PUBLIC_TOKEN_SECRET;
  if (!s || s.length < 24) {
    throw new Error("PUBLIC_TOKEN_SECRET no está configurado o es demasiado corto.");
  }
  return s;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

/** Produce a tamper-resistant token tied to a ticket id. Salt makes regenerated tokens unique. */
export function signPublicToken(ticketId: string): string {
  const salt = base64url(randomBytes(8));
  const payload = `${ticketId}.${salt}`;
  const sig = base64url(createHmac("sha256", getSecret()).update(payload).digest());
  return `${base64url(Buffer.from(payload))}.${sig}`;
}

export function verifyPublicToken(token: string): { ticketId: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, sigB64] = parts;
    const payloadBuf = fromBase64url(payloadB64);
    const payload = payloadBuf.toString("utf-8");
    const expected = base64url(createHmac("sha256", getSecret()).update(payload).digest());
    const a = Buffer.from(sigB64);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const [ticketId] = payload.split(".");
    if (!ticketId) return null;
    return { ticketId };
  } catch {
    return null;
  }
}

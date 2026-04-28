"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { repos } from "@/lib/repositories";
import { LoginInputSchema } from "@/lib/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import type { Role } from "@/lib/flow/ppf-stages";

export interface LoginState {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
}

const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard",
  tecnico: "/tecnico",
  especialista: "/especialista",
  qc: "/qc",
};

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const tree = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        email: tree.email?.[0],
        password: tree.password?.[0],
      },
    };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`login:${ip}`, 5, 60_000)) {
    return { error: "Demasiados intentos. Espera un minuto e intenta de nuevo." };
  }

  const user = await repos.users.findByEmail(parsed.data.email);
  if (!user || !user.active) return { error: "Credenciales incorrectas." };

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "Credenciales incorrectas." };

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  await setSessionCookie(token);

  const next = (formData.get("next") as string | null) || ROLE_HOME[user.role];
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

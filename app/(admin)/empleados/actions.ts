"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { newId } from "@/lib/repositories/json/storage";
import { ROLES } from "@/lib/flow/ppf-stages";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const CreateSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  role: z.enum(ROLES),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  active: z.boolean(),
});

const UpdateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(ROLES),
  password: z.string().min(8).optional().or(z.literal("")),
  active: z.boolean(),
});

function flat(obj: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) if (v && v[0]) out[k] = v[0];
  return out;
}

export async function createEmployeeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const parsed = CreateSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: String(formData.get("role") ?? ""),
    password: String(formData.get("password") ?? ""),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }
  const existing = await repos.users.findByEmail(parsed.data.email);
  if (existing) return { ok: false, fieldErrors: { email: "Ya existe un usuario con ese email." } };

  await repos.users.create({
    id: newId("u"),
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role,
    name: parsed.data.name,
    active: parsed.data.active,
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/empleados");
  return { ok: true };
}

export async function updateEmployeeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "ID faltante." };

  const parsed = UpdateSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: String(formData.get("role") ?? ""),
    password: String(formData.get("password") ?? ""),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }

  const existing = await repos.users.findByEmail(parsed.data.email);
  if (existing && existing.id !== id) {
    return { ok: false, fieldErrors: { email: "Ya existe otro usuario con ese email." } };
  }

  const patch: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    active: parsed.data.active,
  };
  if (parsed.data.password) {
    patch.passwordHash = await hashPassword(parsed.data.password);
  }
  await repos.users.update(id, patch);
  revalidatePath("/empleados");
  return { ok: true };
}

export async function deleteEmployeeAction(id: string): Promise<ActionResult> {
  const session = await requireRole("admin");
  if (id === session.sub) {
    return { ok: false, error: "No puedes eliminar tu propio usuario." };
  }
  // Check assignments — if any active ticket references this user, block delete.
  const tickets = await repos.tickets.list();
  const blocking = tickets.filter(
    (t) =>
      t.status !== "completado" &&
      (t.assignedTecnicoId === id ||
        t.assignedEspecialistaId === id ||
        t.assignedQcId === id),
  );
  if (blocking.length > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${blocking.length} ticket activo${blocking.length === 1 ? " lo tiene" : "s lo tienen"} asignado.`,
    };
  }
  await repos.users.remove(id);
  revalidatePath("/empleados");
  return { ok: true };
}

export async function toggleEmployeeActiveAction(id: string): Promise<ActionResult> {
  const session = await requireRole("admin");
  if (id === session.sub) {
    return { ok: false, error: "No puedes desactivarte a ti mismo." };
  }
  const u = await repos.users.findById(id);
  if (!u) return { ok: false, error: "Usuario no encontrado." };
  await repos.users.update(id, { active: !u.active });
  revalidatePath("/empleados");
  return { ok: true };
}

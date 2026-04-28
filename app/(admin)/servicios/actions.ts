"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import { ServiceTypeSchema } from "@/lib/schemas";
import { newId } from "@/lib/repositories/json/storage";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const CreateSchema = z.object({
  clientId: z.string().min(1),
  vehicleId: z.string().min(1),
  type: ServiceTypeSchema,
  completedAt: z.string().datetime({ offset: true }),
  notes: z.string().max(500).optional(),
});

const UpdateNotesSchema = z.object({
  id: z.string().min(1),
  notes: z.string().max(500).optional(),
});

function flat(obj: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) if (v && v[0]) out[k] = v[0];
  return out;
}

function toIsoFromLocal(v: string): string | null {
  if (!v) return null;
  // datetime-local input gives "YYYY-MM-DDTHH:MM" without timezone — interpret as local then to ISO.
  try {
    return new Date(v).toISOString();
  } catch {
    return null;
  }
}

export async function createServiceAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const completed = toIsoFromLocal(String(formData.get("completedAt") ?? ""));
  if (!completed) return { ok: false, fieldErrors: { completedAt: "Fecha inválida." } };

  const parsed = CreateSchema.safeParse({
    clientId: String(formData.get("clientId") ?? ""),
    vehicleId: String(formData.get("vehicleId") ?? ""),
    type: String(formData.get("type") ?? ""),
    completedAt: completed,
    notes: (String(formData.get("notes") ?? "").trim() || undefined) as string | undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }

  // Verify the vehicle belongs to the client
  const v = await repos.vehicles.findById(parsed.data.vehicleId);
  if (!v || v.clientId !== parsed.data.clientId) {
    return { ok: false, fieldErrors: { vehicleId: "El vehículo no pertenece a este cliente." } };
  }

  await repos.services.create({
    id: newId("s"),
    clientId: parsed.data.clientId,
    vehicleId: parsed.data.vehicleId,
    ticketId: `manual_${Date.now()}`,
    type: parsed.data.type,
    catalogItemIds: [],
    completedAt: parsed.data.completedAt,
    notes: parsed.data.notes,
  });

  // Bump client lastVisit if this is more recent than the current one.
  const client = await repos.clients.findById(parsed.data.clientId);
  if (client && (!client.lastVisitAt || client.lastVisitAt < parsed.data.completedAt)) {
    await repos.clients.update(parsed.data.clientId, { lastVisitAt: parsed.data.completedAt });
  }

  revalidatePath("/servicios");
  revalidatePath(`/clientes/${parsed.data.clientId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateServiceNotesAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const parsed = UpdateNotesSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    notes: (String(formData.get("notes") ?? "").trim() || undefined) as string | undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }
  const services = await repos.services.list();
  const s = services.find((x) => x.id === parsed.data.id);
  if (!s) return { ok: false, error: "Servicio no encontrado." };
  // services repo only exposes create() — emulate update via re-write
  const all = services.map((x) => (x.id === s.id ? { ...x, notes: parsed.data.notes } : x));
  // Use the storage layer directly for update. Cleanest is to add to interface,
  // but to keep this scoped, use a write-through via removing+recreating is risky.
  // We extended the JSON repo to support a write below.
  await rewriteServices(all);
  revalidatePath("/servicios");
  revalidatePath(`/clientes/${s.clientId}`);
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  await requireRole("admin");
  const services = await repos.services.list();
  const s = services.find((x) => x.id === id);
  if (!s) return { ok: false, error: "Servicio no encontrado." };
  const all = services.filter((x) => x.id !== id);
  await rewriteServices(all);
  revalidatePath("/servicios");
  revalidatePath(`/clientes/${s.clientId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

// Helper to overwrite the services collection (services repo doesn't expose update/remove).
async function rewriteServices(rows: Awaited<ReturnType<typeof repos.services.list>>) {
  const { writeCollection } = await import("@/lib/repositories/json/storage");
  await writeCollection("services", rows);
}

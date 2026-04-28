"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import { ClientInputSchema, VehicleInputSchema } from "@/lib/schemas";
import { newId } from "@/lib/repositories/json/storage";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function flat(obj: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) if (v && v[0]) out[k] = v[0];
  return out;
}

export async function createClientAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const tierRaw = String(formData.get("tier") ?? "").trim();
  const parsed = ClientInputSchema.safeParse({
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: (String(formData.get("email") ?? "").trim() || undefined) as string | undefined,
    notes: (String(formData.get("notes") ?? "").trim() || undefined) as string | undefined,
    tier: tierRaw === "" ? undefined : tierRaw,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }
  await repos.clients.create({
    ...parsed.data,
    id: newId("c"),
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/clientes");
  return { ok: true };
}

export async function updateClientAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "ID faltante." };

  const tierRaw = String(formData.get("tier") ?? "").trim();
  const parsed = ClientInputSchema.safeParse({
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: (String(formData.get("email") ?? "").trim() || undefined) as string | undefined,
    notes: (String(formData.get("notes") ?? "").trim() || undefined) as string | undefined,
    tier: tierRaw === "" ? undefined : tierRaw,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }
  await repos.clients.update(id, parsed.data);
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true };
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  await requireRole("admin");
  // Block delete if client has any tickets (active or completed) or vehicles or services.
  const [tickets, vehicles, services] = await Promise.all([
    repos.tickets.list(),
    repos.vehicles.listByClient(id),
    repos.services.listByClient(id),
  ]);
  const hasTickets = tickets.some((t) => t.clientId === id);
  if (hasTickets || vehicles.length > 0 || services.length > 0) {
    return {
      ok: false,
      error: "No se puede eliminar: el cliente tiene vehículos, tickets o servicios asociados.",
    };
  }
  await repos.clients.remove(id);
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function createVehicleAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) return { ok: false, error: "Cliente requerido." };

  const yearN = parseInt(String(formData.get("year") ?? ""), 10);
  const parsed = VehicleInputSchema.safeParse({
    clientId,
    brand: String(formData.get("brand") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    year: Number.isFinite(yearN) ? yearN : 0,
    plate: String(formData.get("plate") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    vin: (String(formData.get("vin") ?? "").trim() || undefined) as string | undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }
  await repos.vehicles.create({ ...parsed.data, id: newId("v") });
  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

export async function updateVehicleAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!id || !clientId) return { ok: false, error: "Faltan IDs." };

  const yearN = parseInt(String(formData.get("year") ?? ""), 10);
  const parsed = VehicleInputSchema.safeParse({
    clientId,
    brand: String(formData.get("brand") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    year: Number.isFinite(yearN) ? yearN : 0,
    plate: String(formData.get("plate") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    vin: (String(formData.get("vin") ?? "").trim() || undefined) as string | undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flat(parsed.error.flatten().fieldErrors) };
  }
  await repos.vehicles.update(id, parsed.data);
  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

export async function deleteVehicleAction(
  id: string,
  clientId: string,
): Promise<ActionResult> {
  await requireRole("admin");
  const tickets = await repos.tickets.list();
  if (tickets.some((t) => t.vehicleId === id)) {
    return {
      ok: false,
      error: "No se puede eliminar: hay tickets asociados a este vehículo.",
    };
  }
  await repos.vehicles.remove(id);
  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import {
  ClientInputSchema,
  NewTicketInputSchema,
  VehicleInputSchema,
  type Vehicle,
  type Client,
  type Ticket,
} from "@/lib/schemas";
import { newId } from "@/lib/repositories/json/storage";
import { signPublicToken } from "@/lib/crypto/public-token";
import { stepsForTicket } from "@/lib/flow/ppf-stages";

export interface NewTicketState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function f(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createTicketAction(
  _prev: NewTicketState,
  formData: FormData,
): Promise<NewTicketState> {
  await requireRole("admin");

  const mode = f(formData, "clientMode"); // "existing" | "new"
  let clientId = f(formData, "clientId");

  if (mode === "new") {
    const input = ClientInputSchema.safeParse({
      fullName: f(formData, "fullName"),
      phone: f(formData, "phone"),
      email: f(formData, "email") || undefined,
    });
    if (!input.success) {
      return { error: "Datos del cliente inválidos.", fieldErrors: flat(input.error.flatten().fieldErrors) };
    }
    const newClient: Client = {
      ...input.data,
      id: newId("c"),
      createdAt: new Date().toISOString(),
    };
    await repos.clients.create(newClient);
    clientId = newClient.id;
  }
  if (!clientId) return { error: "Selecciona o crea un cliente." };

  const vMode = f(formData, "vehicleMode"); // "existing" | "new"
  let vehicleId = f(formData, "vehicleId");
  if (vMode === "new") {
    const yearN = parseInt(f(formData, "year"), 10);
    const vinput = VehicleInputSchema.safeParse({
      clientId,
      brand: f(formData, "brand"),
      model: f(formData, "model"),
      year: Number.isFinite(yearN) ? yearN : 0,
      plate: f(formData, "plate"),
      color: f(formData, "color"),
      vin: f(formData, "vin") || undefined,
    });
    if (!vinput.success) {
      return { error: "Datos del vehículo inválidos.", fieldErrors: flat(vinput.error.flatten().fieldErrors) };
    }
    const newVehicle: Vehicle = { ...vinput.data, id: newId("v") };
    await repos.vehicles.create(newVehicle);
    vehicleId = newVehicle.id;
  }
  if (!vehicleId) return { error: "Selecciona o crea un vehículo." };

  const catalogItemIds = formData
    .getAll("catalogItemIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const tinput = NewTicketInputSchema.safeParse({
    clientId,
    vehicleId,
    serviceType: f(formData, "serviceType") as "PPF" | "CeramicCoating" | "Both",
    catalogItemIds,
    isOfferVehicle: f(formData, "isOfferVehicle") === "on",
    etaAt: new Date(f(formData, "etaAt")).toISOString(),
    assignedTecnicoId: f(formData, "assignedTecnicoId") || undefined,
    assignedEspecialistaId: f(formData, "assignedEspecialistaId") || undefined,
    assignedQcId: f(formData, "assignedQcId") || undefined,
  });
  if (!tinput.success) {
    return { error: "Datos del ticket inválidos.", fieldErrors: flat(tinput.error.flatten().fieldErrors) };
  }

  const id = newId("tk");
  const now = new Date().toISOString();
  const steps = stepsForTicket(tinput.data.isOfferVehicle).map((s) => ({
    key: s.key,
    completed: s.key === "orden_servicio",
    completedAt: s.key === "orden_servicio" ? now : undefined,
    completedBy: s.key === "orden_servicio" ? "u_admin" : undefined,
  }));
  const ticket: Ticket = {
    id,
    clientId: tinput.data.clientId,
    vehicleId: tinput.data.vehicleId,
    isOfferVehicle: tinput.data.isOfferVehicle,
    serviceType: tinput.data.serviceType,
    catalogItemIds: tinput.data.catalogItemIds,
    status: "recepcion",
    steps,
    comments: [],
    assignedTecnicoId: tinput.data.assignedTecnicoId,
    assignedEspecialistaId: tinput.data.assignedEspecialistaId,
    assignedQcId: tinput.data.assignedQcId,
    createdAt: now,
    etaAt: tinput.data.etaAt,
    publicToken: signPublicToken(id),
  };
  await repos.tickets.create(ticket);

  revalidatePath("/dashboard");
  revalidatePath("/tablero");
  redirect(`/tickets/${id}`);
}

function flat(input: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}

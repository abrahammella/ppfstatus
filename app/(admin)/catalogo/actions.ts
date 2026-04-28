"use server";

import { revalidatePath } from "next/cache";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import { CatalogItemInputSchema, type CatalogItem } from "@/lib/schemas";
import { newId } from "@/lib/repositories/json/storage";

export interface CatalogState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function f(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function flat(input: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}

function parseInput(formData: FormData) {
  const priceRaw = f(formData, "priceUsd");
  const priceUsd = priceRaw === "" ? undefined : Number(priceRaw);
  return CatalogItemInputSchema.safeParse({
    name: f(formData, "name"),
    category: f(formData, "category"),
    active: f(formData, "active") === "on",
    priceUsd: priceUsd && Number.isFinite(priceUsd) ? priceUsd : undefined,
    notes: f(formData, "notes") || undefined,
  });
}

export async function createCatalogItemAction(
  _prev: CatalogState,
  formData: FormData,
): Promise<CatalogState> {
  await requireRole("admin");
  const input = parseInput(formData);
  if (!input.success) {
    return { error: "Datos inválidos.", fieldErrors: flat(input.error.flatten().fieldErrors) };
  }
  const item: CatalogItem = { ...input.data, id: newId("ci") };
  await repos.catalog.create(item);
  revalidatePath("/catalogo");
  revalidatePath("/tickets/nuevo");
  return { ok: true };
}

export async function updateCatalogItemAction(
  _prev: CatalogState,
  formData: FormData,
): Promise<CatalogState> {
  await requireRole("admin");
  const id = f(formData, "id");
  if (!id) return { error: "Falta id." };
  const input = parseInput(formData);
  if (!input.success) {
    return { error: "Datos inválidos.", fieldErrors: flat(input.error.flatten().fieldErrors) };
  }
  await repos.catalog.update(id, input.data);
  revalidatePath("/catalogo");
  revalidatePath("/tickets/nuevo");
  return { ok: true };
}

export async function toggleCatalogItemAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = f(formData, "id");
  const item = await repos.catalog.findById(id);
  if (!item) return;
  await repos.catalog.update(id, { active: !item.active });
  revalidatePath("/catalogo");
  revalidatePath("/tickets/nuevo");
}

export async function deleteCatalogItemAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = f(formData, "id");
  // Block delete if any ticket or service uses this item
  const [tickets, services] = await Promise.all([
    repos.tickets.list(),
    repos.services.list(),
  ]);
  const inUse =
    tickets.some((t) => t.catalogItemIds?.includes(id)) ||
    services.some((s) => s.catalogItemIds?.includes(id));
  if (inUse) {
    // Soft-delete by deactivating instead.
    await repos.catalog.update(id, { active: false });
  } else {
    await repos.catalog.remove(id);
  }
  revalidatePath("/catalogo");
  revalidatePath("/tickets/nuevo");
}

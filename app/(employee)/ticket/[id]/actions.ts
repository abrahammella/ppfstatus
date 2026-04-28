"use server";

import { revalidatePath } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { repos } from "@/lib/repositories";
import { requireSession } from "@/lib/auth/session";
import {
  STEPS,
  deriveStage,
  stepsForTicket,
  type Role,
  type StepKey,
} from "@/lib/flow/ppf-stages";
import type { CompleteResult } from "@/components/ticket/ticket-checklist";
import { newId } from "@/lib/repositories/json/storage";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic") return "heic";
  return "jpg";
}

async function savePhoto(ticketId: string, stepKey: string, file: File): Promise<string> {
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Foto demasiado grande (máx 5MB).");
  if (!file.type.startsWith("image/")) throw new Error("Archivo debe ser una imagen.");
  const dir = path.join(process.cwd(), "public", "uploads", ticketId);
  await fs.mkdir(dir, { recursive: true });
  const ext = extFromMime(file.type);
  const filename = `${stepKey}-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buf);
  return `/uploads/${ticketId}/${filename}`;
}

export async function completeStepAction(formData: FormData): Promise<CompleteResult> {
  try {
    const session = await requireSession();
    const ticketId = String(formData.get("ticketId") ?? "");
    const stepKey = String(formData.get("stepKey") ?? "") as StepKey;
    const notes = String(formData.get("notes") ?? "").slice(0, 500) || undefined;
    const photo = formData.get("photo") as File | null;

    const def = STEPS.find((s) => s.key === stepKey);
    if (!def) return { ok: false, error: "Paso desconocido." };

    const ticket = await repos.tickets.findById(ticketId);
    if (!ticket) return { ok: false, error: "Ticket no encontrado." };

    const allowed: Role[] = session.role === "admin" ? ["admin"] : [def.roleResponsible];
    if (session.role !== "admin" && !allowed.includes(session.role)) {
      return { ok: false, error: "No tienes permiso sobre este paso." };
    }
    // Employees can only act on tickets assigned to them.
    if (session.role !== "admin") {
      const assignedId =
        session.role === "tecnico"
          ? ticket.assignedTecnicoId
          : session.role === "especialista"
            ? ticket.assignedEspecialistaId
            : ticket.assignedQcId;
      if (assignedId !== session.sub) {
        return { ok: false, error: "No estás asignado a este ticket." };
      }
    }

    let photoUrl: string | undefined;
    if (photo && typeof photo === "object" && "size" in photo && photo.size > 0) {
      photoUrl = await savePhoto(ticketId, stepKey, photo);
    }

    const completedAt = new Date().toISOString();
    const updatedSteps = ticket.steps.map((s) =>
      s.key === stepKey
        ? { ...s, completed: true, completedAt, completedBy: session.sub, photoUrl, notes }
        : s,
    );

    const completedKeys = new Set(updatedSteps.filter((s) => s.completed).map((s) => s.key));
    const newStatus = deriveStage(ticket.isOfferVehicle, completedKeys);

    const patch = {
      steps: updatedSteps,
      status: newStatus,
      completedAt: newStatus === "completado" ? completedAt : undefined,
    };

    await repos.tickets.update(ticketId, patch);

    // If the ticket reached completed, materialize a Service record + bump client lastVisit.
    if (newStatus === "completado") {
      await repos.services.create({
        id: newId("s"),
        vehicleId: ticket.vehicleId,
        clientId: ticket.clientId,
        ticketId: ticket.id,
        type: ticket.serviceType,
        completedAt,
      });
      await repos.clients.update(ticket.clientId, { lastVisitAt: completedAt }).catch(() => null);
    }

    revalidatePath("/dashboard");
    revalidatePath("/tablero");
    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/tecnico");
    revalidatePath("/especialista");
    revalidatePath("/qc");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Required helper: lets callers know how many steps remain in a ticket. */
export async function pendingStepCount(id: string): Promise<number> {
  const t = await repos.tickets.findById(id);
  if (!t) return 0;
  const total = stepsForTicket(t.isOfferVehicle).length;
  const done = t.steps.filter((s) => s.completed).length;
  return total - done;
}

"use server";

import { revalidatePath } from "next/cache";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import {
  STAGES,
  type Stage,
  stepsForTicket,
} from "@/lib/flow/ppf-stages";

/** Admin can drag a ticket directly to any stage; we sync the ticket.steps so
 * progress reflects the new position (auto-complete prior stages, un-complete later ones). */
export async function moveTicketStage(id: string, target: Stage): Promise<void> {
  await requireRole("admin");
  if (!STAGES.includes(target)) throw new Error("Etapa inválida.");
  const ticket = await repos.tickets.findById(id);
  if (!ticket) throw new Error("Ticket no encontrado.");

  const targetIdx = STAGES.indexOf(target);
  const stageOf = (key: string) =>
    stepsForTicket(ticket.isOfferVehicle).find((s) => s.key === key)?.stage ?? "completado";

  const now = new Date().toISOString();
  const newSteps = ticket.steps.map((s) => {
    const idx = STAGES.indexOf(stageOf(s.key) as Stage);
    if (idx < targetIdx) {
      return s.completed
        ? s
        : { ...s, completed: true, completedAt: now, completedBy: s.completedBy ?? "u_admin" };
    }
    if (idx > targetIdx) {
      return { ...s, completed: false, completedAt: undefined, completedBy: undefined, photoUrl: undefined };
    }
    return s;
  });

  await repos.tickets.update(id, { status: target, steps: newSteps });
  revalidatePath("/dashboard");
  revalidatePath("/tablero");
}

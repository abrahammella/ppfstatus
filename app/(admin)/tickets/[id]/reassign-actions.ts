"use server";

import { revalidatePath } from "next/cache";
import { repos } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";

export interface ReassignResult {
  ok: boolean;
  error?: string;
}

export async function reassignTicketAction(formData: FormData): Promise<ReassignResult> {
  await requireRole("admin");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  if (!ticketId) return { ok: false, error: "Ticket inválido." };

  const tecnico = String(formData.get("assignedTecnicoId") ?? "").trim();
  const especialista = String(formData.get("assignedEspecialistaId") ?? "").trim();
  const qc = String(formData.get("assignedQcId") ?? "").trim();

  await repos.tickets.update(ticketId, {
    assignedTecnicoId: tecnico || undefined,
    assignedEspecialistaId: especialista || undefined,
    assignedQcId: qc || undefined,
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tablero");
  revalidatePath("/dashboard");
  return { ok: true };
}

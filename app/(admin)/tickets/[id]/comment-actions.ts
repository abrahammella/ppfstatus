"use server";

import { revalidatePath } from "next/cache";
import { repos } from "@/lib/repositories";
import { requireSession } from "@/lib/auth/session";
import { newId } from "@/lib/repositories/json/storage";
import type { TicketComment } from "@/lib/schemas";

export interface CommentResult {
  ok: boolean;
  error?: string;
}

export async function addCommentAction(formData: FormData): Promise<CommentResult> {
  const session = await requireSession();
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim().slice(0, 1000);
  if (!ticketId) return { ok: false, error: "Ticket inválido." };
  if (!text) return { ok: false, error: "El comentario está vacío." };

  const ticket = await repos.tickets.findById(ticketId);
  if (!ticket) return { ok: false, error: "Ticket no encontrado." };

  // Employees can only comment on tickets they're assigned to.
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

  const comment: TicketComment = {
    id: newId("cmt"),
    authorId: session.sub,
    text,
    createdAt: new Date().toISOString(),
  };

  const next = [...(ticket.comments ?? []), comment];
  await repos.tickets.update(ticketId, { comments: next });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath(`/ticket/${ticketId}`);
  return { ok: true };
}

export async function deleteCommentAction(formData: FormData): Promise<CommentResult> {
  const session = await requireSession();
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const commentId = String(formData.get("commentId") ?? "").trim();
  if (!ticketId || !commentId) return { ok: false, error: "Datos inválidos." };

  const ticket = await repos.tickets.findById(ticketId);
  if (!ticket) return { ok: false, error: "Ticket no encontrado." };

  const comment = (ticket.comments ?? []).find((c) => c.id === commentId);
  if (!comment) return { ok: false, error: "Comentario no encontrado." };

  // Only author or admin can delete.
  if (session.role !== "admin" && comment.authorId !== session.sub) {
    return { ok: false, error: "Solo el autor o un administrador pueden eliminar." };
  }

  const next = (ticket.comments ?? []).filter((c) => c.id !== commentId);
  await repos.tickets.update(ticketId, { comments: next });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath(`/ticket/${ticketId}`);
  return { ok: true };
}

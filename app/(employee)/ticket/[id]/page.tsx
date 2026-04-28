import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getEnrichedTicket } from "@/lib/queries";
import { TicketChecklist } from "@/components/ticket/ticket-checklist";
import { StageBadge } from "@/components/ticket/stage-badge";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { progressPercent, ROLE_LABELS } from "@/lib/flow/ppf-stages";
import { SectionCard } from "@/components/dashboard/section-card";
import { completeStepAction } from "./actions";
import { CommentsThread } from "@/components/ticket/comments-thread";
import { repos } from "@/lib/repositories";

export const dynamic = "force-dynamic";

const HOME_BY_ROLE = {
  tecnico: "/tecnico",
  especialista: "/especialista",
  qc: "/qc",
  admin: "/dashboard",
} as const;

export default async function EmployeeTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const [ticket, users] = await Promise.all([
    getEnrichedTicket(id),
    repos.users.list(),
  ]);
  if (!ticket) notFound();

  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const pct = progressPercent(ticket.isOfferVehicle, completed);
  const home = HOME_BY_ROLE[session.role];

  // Employee can comment only if assigned to this ticket.
  const assignedId =
    session.role === "tecnico"
      ? ticket.assignedTecnicoId
      : session.role === "especialista"
        ? ticket.assignedEspecialistaId
        : session.role === "qc"
          ? ticket.assignedQcId
          : null;
  const canComment = session.role === "admin" || assignedId === session.sub;

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2">
        <Link
          href={home}
          className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700"
        >
          ← Volver
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mt-3">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
              <span className="h-px w-6 bg-brand-red-600" /> {ROLE_LABELS[session.role]}
            </p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
              {ticket.vehicle?.brand} {ticket.vehicle?.model} {ticket.vehicle?.year}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {ticket.client?.fullName} · {ticket.vehicle?.color} · placa{" "}
              <span className="font-mono">{ticket.vehicle?.plate}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StageBadge stage={ticket.status} />
            <ProgressPill percent={pct} />
          </div>
        </div>
      </div>

      <SectionCard delay={0.1}>
        <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
              Checklist
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Marca como completados los pasos asignados a tu rol. Adjunta una foto opcional como
              evidencia (arrastra y suelta).
            </p>
          </div>
        </div>
        <TicketChecklist
          ticket={ticket}
          role={session.role}
          actorId={session.sub}
          completeAction={completeStepAction}
        />
      </SectionCard>

      <SectionCard delay={0.18}>
        <h2 className="text-base font-black uppercase tracking-tight text-zinc-900 mb-4">
          Comentarios del equipo
        </h2>
        <CommentsThread
          ticketId={ticket.id}
          comments={ticket.comments ?? []}
          authors={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))}
          currentUserId={session.sub}
          currentUserRole={session.role}
          canComment={canComment}
        />
      </SectionCard>
    </div>
  );
}

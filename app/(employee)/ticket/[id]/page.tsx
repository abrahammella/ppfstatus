import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getEnrichedTicket } from "@/lib/queries";
import { TicketChecklist } from "@/components/ticket/ticket-checklist";
import { StageBadge } from "@/components/ticket/stage-badge";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { progressPercent, ROLE_LABELS } from "@/lib/flow/ppf-stages";
import { completeStepAction } from "./actions";

export const dynamic = "force-dynamic";

const HOME_BY_ROLE = {
  tecnico: "/tecnico",
  especialista: "/especialista",
  qc: "/qc",
  admin: "/dashboard",
} as const;

export default async function EmployeeTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const ticket = await getEnrichedTicket(id);
  if (!ticket) notFound();

  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const pct = progressPercent(ticket.isOfferVehicle, completed);
  const home = HOME_BY_ROLE[session.role];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <Link href={home} className="text-sm text-brand-red-600 hover:text-brand-red-700">
            ← Volver
          </Link>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mt-2">
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

      <div className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Checklist</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Marca como completados los pasos asignados a tu rol ({ROLE_LABELS[session.role]}). Puedes
          adjuntar una foto opcional como evidencia.
        </p>
        <TicketChecklist
          ticket={ticket}
          role={session.role}
          actorId={session.sub}
          completeAction={completeStepAction}
        />
      </div>
    </div>
  );
}

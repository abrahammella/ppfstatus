import Link from "next/link";
import { listEnrichedTickets, type EnrichedTicket } from "@/lib/queries";
import { ROLE_LABELS, type Role, progressPercent, STAGE_LABELS } from "@/lib/flow/ppf-stages";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { StageBadge } from "@/components/ticket/stage-badge";

interface RoleConfig {
  role: Role;
  stages: Array<EnrichedTicket["status"]>;
  pickAssigned: (t: EnrichedTicket) => string | undefined;
  emptyText: string;
}

export async function MyTicketsPage({
  userId,
  config,
}: {
  userId: string;
  config: RoleConfig;
}) {
  const all = await listEnrichedTickets();
  const mine = all.filter(
    (t) => config.pickAssigned(t) === userId && config.stages.includes(t.status),
  );
  const others = all.filter(
    (t) => config.pickAssigned(t) === userId && !config.stages.includes(t.status),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2">
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900">
          {ROLE_LABELS[config.role]}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {mine.length} ticket{mine.length === 1 ? "" : "s"} esperando tu trabajo.
        </p>
      </div>

      {mine.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white/60 backdrop-blur-sm p-10 text-center">
          <div className="text-zinc-700 font-medium">{config.emptyText}</div>
          <div className="text-xs text-zinc-500 mt-1">Vuelve a revisar más tarde.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mine.map((t) => (
            <TicketCardLink key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {others.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-3">
            Otros tickets asignados a ti
          </h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-80">
            {others.map((t) => (
              <TicketCardLink key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TicketCardLink({ ticket }: { ticket: EnrichedTicket }) {
  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const pct = progressPercent(ticket.isOfferVehicle, completed);
  return (
    <Link
      href={`/ticket/${ticket.id}`}
      className="block rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-zinc-900 truncate">
            {ticket.vehicle?.brand} {ticket.vehicle?.model}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {ticket.client?.fullName} · {ticket.vehicle?.year} {ticket.vehicle?.color}
          </div>
        </div>
        <StageBadge stage={ticket.status} />
      </div>
      <ProgressPill percent={pct} />
      <div className="mt-3 text-xs text-zinc-500">
        Etapa actual: <span className="text-zinc-900">{STAGE_LABELS[ticket.status]}</span>
        <span className="float-right">
          ETA{" "}
          {new Date(ticket.etaAt).toLocaleString("es-DO", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </Link>
  );
}

export const tecnicoConfig: RoleConfig = {
  role: "tecnico",
  stages: ["lavado"],
  pickAssigned: (t) => t.assignedTecnicoId,
  emptyText: "No hay vehículos pendientes de lavado.",
};
export const especialistaConfig: RoleConfig = {
  role: "especialista",
  stages: ["aplicacion"],
  pickAssigned: (t) => t.assignedEspecialistaId,
  emptyText: "No hay vehículos pendientes de aplicación.",
};
export const qcConfig: RoleConfig = {
  role: "qc",
  stages: ["qc"],
  pickAssigned: (t) => t.assignedQcId,
  emptyText: "No hay vehículos pendientes de revisión.",
};

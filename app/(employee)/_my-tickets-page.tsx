import Link from "next/link";
import { listEnrichedTickets, type EnrichedTicket } from "@/lib/queries";
import { ROLE_LABELS, type Role, progressPercent, STAGE_LABELS } from "@/lib/flow/ppf-stages";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { StageBadge } from "@/components/ticket/stage-badge";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

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

  // KPIs: steps I completed in the last 7d & 30d, avg step duration, completed tickets touched
  const now = Date.now();
  const cutoff7 = now - 7 * DAY;
  const cutoff30 = now - 30 * DAY;
  const stepDurations: number[] = [];
  let stepsLast7 = 0;
  let stepsLast30 = 0;
  const ticketsTouched = new Set<string>();
  for (const t of all) {
    const sortedSteps = [...t.steps]
      .filter((s) => s.completed && s.completedAt)
      .sort((a, b) =>
        (a.completedAt as string) < (b.completedAt as string) ? -1 : 1,
      );
    for (let i = 0; i < sortedSteps.length; i++) {
      const s = sortedSteps[i];
      if (s.completedBy !== userId) continue;
      ticketsTouched.add(t.id);
      const at = new Date(s.completedAt as string).getTime();
      if (at >= cutoff7) stepsLast7++;
      if (at >= cutoff30) stepsLast30++;
      // duration since previous step in the same ticket (approx work time)
      const prev = sortedSteps[i - 1];
      if (prev && prev.completedAt) {
        const dur = (at - new Date(prev.completedAt).getTime()) / HOUR;
        if (dur > 0 && dur < 48) stepDurations.push(dur);
      }
    }
  }
  const avgDurH =
    stepDurations.length === 0
      ? null
      : stepDurations.reduce((a, b) => a + b, 0) / stepDurations.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
          <span className="h-px w-6 bg-brand-red-600" /> Mi panel
        </p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
          {ROLE_LABELS[config.role]}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {mine.length} ticket{mine.length === 1 ? "" : "s"} esperando tu trabajo.
        </p>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Tickets activos"
          value={String(mine.length)}
          helper="Asignados a ti ahora"
          tone="brand"
        />
        <KpiTile
          label="Pasos esta semana"
          value={String(stepsLast7)}
          helper={`${stepsLast30} en últimos 30 días`}
        />
        <KpiTile
          label="Tickets tocados"
          value={String(ticketsTouched.size)}
          helper="En total históricos"
        />
        <KpiTile
          label="Tiempo promedio"
          value={avgDurH === null ? "—" : `${avgDurH.toFixed(1)}h`}
          helper="Entre pasos consecutivos"
        />
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

function KpiTile({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "brand";
}) {
  if (tone === "brand") {
    return (
      <div className="rounded-2xl bg-brand-black text-white p-4 shadow-sm relative overflow-hidden">
        <div className="absolute -bottom-12 -right-10 size-32 rounded-full brand-glow blur-3xl opacity-70 pointer-events-none" />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {label}
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums text-white">{value}</div>
          {helper ? (
            <div className="text-[11px] text-zinc-400 mt-0.5">{helper}</div>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tabular-nums text-zinc-900">{value}</div>
      {helper ? <div className="text-[11px] text-zinc-500 mt-0.5">{helper}</div> : null}
    </div>
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

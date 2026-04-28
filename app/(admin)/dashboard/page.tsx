import Link from "next/link";
import { getDashboardKpis } from "@/lib/analytics";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { StageBars } from "@/components/dashboard/stage-bars";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { ServiceMix } from "@/components/dashboard/service-mix";
import { SectionCard } from "@/components/dashboard/section-card";
import { ProductivityList } from "@/components/dashboard/productivity-list";
import { StageBadge } from "@/components/ticket/stage-badge";
import { AnimatedNumber } from "@/components/dashboard/animated-number";

export const dynamic = "force-dynamic";

const ICON_BOLT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
const ICON_CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const ICON_CLOCK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const ICON_TARGET = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

function leadTimeView(hoursTotal: number | null) {
  if (hoursTotal === null) return { value: "—", numeric: null, unit: undefined, decimals: 0 };
  if (hoursTotal >= 48)
    return { value: (hoursTotal / 24).toFixed(1), numeric: hoursTotal / 24, unit: "días", decimals: 1 };
  return { value: hoursTotal.toFixed(0), numeric: hoursTotal, unit: "h", decimals: 0 };
}

export default async function DashboardPage() {
  const k = await getDashboardKpis();
  const lead = leadTimeView(k.avgLeadTimeHours.hours);
  const etaPct = k.etaCompliance.rate === null ? null : Math.round(k.etaCompliance.rate * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
            <span className="h-px w-6 bg-brand-red-600" /> Visión general
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pulso del taller en tiempo real. {k.totals.tickets} tickets totales · {k.totals.clients}{" "}
            clientes · {k.totals.services} servicios entregados.
          </p>
        </div>
        <Link
          href="/tablero"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-black text-white text-sm font-bold uppercase tracking-wide px-4 py-2.5 hover:bg-zinc-900 transition ring-1 ring-white/5"
        >
          Ir al tablero →
        </Link>
      </div>

      {/* Hero KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          index={0}
          label="Tickets activos"
          value={String(k.active.total)}
          numericValue={k.active.total}
          helper={`${k.active.byStage.lavado} lavado · ${k.active.byStage.aplicacion} aplicación · ${k.active.byStage.qc} QC`}
          highlight
          icon={ICON_BOLT}
        />
        <KpiTile
          index={1}
          label="Entregas (semana)"
          value={String(k.deliveriesThisWeek.value)}
          numericValue={k.deliveriesThisWeek.value}
          delta={k.deliveriesThisWeek.delta}
          helper={k.deliveriesThisWeek.helper}
          icon={ICON_CHECK}
        />
        <KpiTile
          index={2}
          label="Tiempo medio entrega"
          value={lead.value}
          numericValue={lead.numeric}
          decimals={lead.decimals}
          unit={lead.unit}
          helper={`${k.avgLeadTimeHours.sampleSize} ticket${k.avgLeadTimeHours.sampleSize === 1 ? "" : "s"} completado${k.avgLeadTimeHours.sampleSize === 1 ? "" : "s"}`}
          icon={ICON_CLOCK}
        />
        <KpiTile
          index={3}
          label="Cumplimiento ETA"
          value={etaPct === null ? "—" : String(etaPct)}
          numericValue={etaPct}
          unit={etaPct === null ? undefined : "%"}
          helper={`${k.etaCompliance.onTime} a tiempo de ${k.etaCompliance.total}`}
          icon={ICON_TARGET}
        />
      </div>

      {/* Distribución por etapa + mix */}
      <div className="grid lg:grid-cols-5 gap-4">
        <SectionCard className="lg:col-span-3" delay={0.15}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
                Tickets activos por etapa
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {k.bottleneck.stage
                  ? `Etapa con más carga: ${k.bottleneck.stage} (${k.bottleneck.count})`
                  : "Sin tickets activos."}
              </p>
            </div>
          </div>
          <StageBars byStage={k.active.byStage} highlight={k.bottleneck.stage} />
        </SectionCard>

        <SectionCard className="lg:col-span-2" delay={0.22}>
          <div className="mb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
              Mix de servicios
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">PPF · Ceramic Coating · Combinado.</p>
          </div>
          <ServiceMix mix={k.serviceMix} />
        </SectionCard>
      </div>

      {/* Tendencia */}
      <SectionCard delay={0.28}>
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
              Tendencia últimos 14 días
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Volumen diario de tickets creados vs entregas.
            </p>
          </div>
        </div>
        <TimelineChart buckets={k.last14Days} />
      </SectionCard>

      {/* Atrasados + Próximas entregas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard delay={0.32}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
              Tickets atrasados
            </h2>
            <span className="text-[11px] font-bold uppercase rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-100 px-2.5 py-0.5">
              {k.overdue.length}
            </span>
          </div>
          {k.overdue.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-6 text-center">
              <div className="text-sm font-semibold text-emerald-800">Sin atrasos.</div>
              <div className="text-xs text-emerald-700 mt-0.5">Todo el flujo dentro de ETA.</div>
            </div>
          ) : (
            <ul className="space-y-2">
              {k.overdue.slice(0, 5).map((o) => (
                <li
                  key={o.id}
                  className="rounded-2xl border border-brand-red-100 bg-brand-red-50/50 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/tickets/${o.id}`}
                      className="text-sm font-bold text-zinc-900 truncate hover:text-brand-red-700"
                    >
                      {o.vehicleLabel}
                    </Link>
                    <div className="text-xs text-zinc-600 truncate">{o.clientName}</div>
                  </div>
                  <div className="text-right">
                    <StageBadge stage={o.status} />
                    <div className="text-[11px] font-bold text-brand-red-700 mt-1">
                      +{Math.ceil(o.hoursLate)}h tarde
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard delay={0.38}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
              Próximas entregas
            </h2>
            <span className="text-[11px] font-bold uppercase rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-0.5">
              {k.upcoming.length}
            </span>
          </div>
          {k.upcoming.length === 0 ? (
            <div className="text-sm text-zinc-500 px-4 py-6 text-center">Sin entregas próximas.</div>
          ) : (
            <ul className="space-y-2">
              {k.upcoming.slice(0, 5).map((u) => (
                <li
                  key={u.id}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/tickets/${u.id}`}
                      className="text-sm font-bold text-zinc-900 truncate hover:text-brand-red-700"
                    >
                      {u.vehicleLabel}
                    </Link>
                    <div className="text-xs text-zinc-600 truncate">{u.clientName}</div>
                  </div>
                  <div className="text-right">
                    <StageBadge stage={u.status} />
                    <div className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                      en {Math.max(1, Math.ceil(u.hoursUntil))}h
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Productividad + offer share + monthly count */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-2" delay={0.42}>
          <h2 className="text-base font-black uppercase tracking-tight text-zinc-900 mb-3">
            Productividad (últimos 30 días)
          </h2>
          <ProductivityList rows={k.productivity} />
        </SectionCard>

        <SectionCard dark delay={0.48}>
          <div className="absolute -bottom-20 -right-20 size-60 rounded-full brand-glow blur-3xl opacity-70 pointer-events-none" />
          <div className="relative">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Mes en curso
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-black tabular-nums">
                <AnimatedNumber value={k.deliveriesThisMonth.value} />
              </span>
              <span className="text-sm text-zinc-400">entregas</span>
            </div>
            {typeof k.deliveriesThisMonth.delta === "number" ? (
              <div className="mt-2 text-[11px] text-zinc-300">
                {k.deliveriesThisMonth.delta >= 0 ? "+" : ""}
                {k.deliveriesThisMonth.delta} vs mes anterior
              </div>
            ) : null}

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Vehículos de oferta
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums">
                  <AnimatedNumber value={Math.round(k.offerVehicleShare.ratio * 100)} />
                  <span className="text-sm text-zinc-400 font-bold">%</span>
                </span>
                <span className="text-xs text-zinc-400">del flujo activo</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                {k.offerVehicleShare.active} de {k.active.total} con laminado + alfombras
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

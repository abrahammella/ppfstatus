import { notFound } from "next/navigation";
import Link from "next/link";
import { repos } from "@/lib/repositories";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  ServiceTypeSchema,
} from "@/lib/schemas";
import { STEPS, ROLE_LABELS } from "@/lib/flow/ppf-stages";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<ReturnType<typeof ServiceTypeSchema.parse>, string> = {
  PPF: "PPF",
  CeramicCoating: "Ceramic Coating",
  Both: "PPF + Ceramic Coating",
};

const HOUR = 60 * 60 * 1000;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const services = await repos.services.list();
  const service = services.find((s) => s.id === id);
  if (!service) notFound();

  const [client, vehicle, ticket, users, catalog] = await Promise.all([
    repos.clients.findById(service.clientId),
    repos.vehicles.findById(service.vehicleId),
    repos.tickets.findById(service.ticketId),
    repos.users.list(),
    repos.catalog.list(),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));

  const itemIds = service.catalogItemIds ?? ticket?.catalogItemIds ?? [];
  const selectedItems = itemIds
    .map((id) => catalog.find((c) => c.id === id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));
  const itemsByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: selectedItems.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const totalUsd = selectedItems.reduce((sum, i) => sum + (i.priceUsd ?? 0), 0);

  // Steps timeline (only meaningful when there's a ticket).
  const stepDefs = ticket ? STEPS.filter((d) => ticket.steps.some((s) => s.key === d.key)) : [];
  const stepRows = stepDefs.map((def) => {
    const step = ticket!.steps.find((s) => s.key === def.key)!;
    return {
      def,
      step,
      who: step.completedBy ? userMap.get(step.completedBy) : undefined,
    };
  });

  const photos = ticket
    ? ticket.steps.filter((s) => s.photoUrl).map((s) => ({
        url: s.photoUrl as string,
        stepLabel: STEPS.find((d) => d.key === s.key)?.label ?? s.key,
        completedAt: s.completedAt,
      }))
    : [];

  // Lead time
  const leadTimeHours =
    ticket && ticket.completedAt
      ? (new Date(ticket.completedAt).getTime() - new Date(ticket.createdAt).getTime()) / HOUR
      : null;
  const onTime =
    ticket && ticket.completedAt && ticket.etaAt
      ? new Date(ticket.completedAt) <= new Date(ticket.etaAt)
      : null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="-mt-2">
        <Link
          href="/servicios"
          className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700"
        >
          ← Servicios
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mt-3">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
              <span className="h-px w-6 bg-brand-red-600" /> Servicio {service.id}
            </p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
              {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "Vehículo eliminado"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {client?.fullName ?? "—"}
              {vehicle ? <> · placa <span className="font-mono">{vehicle.plate}</span></> : null}
              {" · "}
              {new Date(service.completedAt).toLocaleString("es-DO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-zinc-900 text-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
              {TYPE_LABEL[service.type]}
            </span>
            {ticket?.id ? (
              <Link
                href={`/tickets/${ticket.id}`}
                className="inline-flex items-center rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide hover:bg-brand-red-100"
              >
                Ver ticket →
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                Pre-plataforma
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Items aplicados" value={String(selectedItems.length)} />
        <Stat
          label="Valor total"
          value={totalUsd > 0 ? `US$${totalUsd}` : "—"}
          helper={totalUsd > 0 ? "Precios actuales del catálogo" : undefined}
        />
        <Stat
          label="Lead time"
          value={
            leadTimeHours === null
              ? "—"
              : leadTimeHours >= 48
                ? `${(leadTimeHours / 24).toFixed(1)}d`
                : `${Math.round(leadTimeHours)}h`
          }
          helper={ticket ? "Recepción → entrega" : undefined}
        />
        <Stat
          label="Cumplimiento ETA"
          value={onTime === null ? "—" : onTime ? "A tiempo" : "Tarde"}
          tone={onTime === true ? "ok" : onTime === false ? "bad" : "neutral"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <section className="lg:col-span-2 rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="text-base font-black uppercase tracking-tight text-zinc-900 mb-4">
            Recorrido completo
          </h2>
          {stepRows.length === 0 ? (
            <div className="text-sm text-zinc-500">
              Servicio histórico pre-plataforma — no hay registro de pasos individuales.
              {service.notes ? (
                <div className="mt-3 rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-700">
                  {service.notes}
                </div>
              ) : null}
            </div>
          ) : (
            <ol className="relative ml-3 space-y-5 border-l border-zinc-200 pl-5">
              {stepRows.map(({ def, step, who }) => (
                <li key={def.key} className="relative">
                  <span
                    className={
                      step.completed
                        ? "absolute -left-[27px] top-1 size-4 rounded-full bg-brand-red-500 ring-4 ring-white flex items-center justify-center text-white text-[9px] font-black"
                        : "absolute -left-[27px] top-1 size-4 rounded-full bg-zinc-200 ring-4 ring-white"
                    }
                  >
                    {step.completed ? "✓" : null}
                  </span>
                  <div className="text-sm font-semibold text-zinc-900">{def.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    {step.completed && step.completedAt ? (
                      <span>
                        {new Date(step.completedAt).toLocaleString("es-DO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="italic">Sin completar</span>
                    )}
                    <span className="text-zinc-300">·</span>
                    <span>{ROLE_LABELS[def.roleResponsible]}</span>
                    {who ? (
                      <>
                        <span className="text-zinc-300">·</span>
                        <span className="font-medium text-zinc-700">{who.name}</span>
                      </>
                    ) : null}
                  </div>
                  {step.notes ? (
                    <div className="mt-2 text-xs text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2">
                      {step.notes}
                    </div>
                  ) : null}
                  {step.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={step.photoUrl}
                      alt={def.label}
                      className="mt-2 max-h-44 rounded-xl border border-zinc-200"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">
              Servicios aplicados
            </h3>
            {itemsByCategory.length === 0 ? (
              <div className="text-xs text-zinc-400 italic">
                Sin items del catálogo registrados.
              </div>
            ) : (
              <div className="space-y-3">
                {itemsByCategory.map((g) => (
                  <div key={g.category}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red-600 mb-1.5">
                      {CATEGORY_LABELS[g.category]}
                    </div>
                    <ul className="space-y-1">
                      {g.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="text-zinc-800">{item.name}</span>
                          {typeof item.priceUsd === "number" ? (
                            <span className="text-xs text-zinc-500 tabular-nums">
                              US${item.priceUsd}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {totalUsd > 0 ? (
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                      Total
                    </span>
                    <span className="text-base font-black text-zinc-900 tabular-nums">
                      US${totalUsd}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">
              Cliente
            </h3>
            <Link
              href={`/clientes/${client?.id ?? ""}`}
              className="text-sm font-semibold text-zinc-900 hover:text-brand-red-700"
            >
              {client?.fullName ?? "—"}
            </Link>
            {client?.phone ? (
              <div className="text-xs text-zinc-500 font-mono mt-0.5">{client.phone}</div>
            ) : null}
          </section>

          {vehicle ? (
            <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">
                Vehículo
              </h3>
              <div className="text-sm font-semibold text-zinc-900">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {vehicle.color} · placa <span className="font-mono">{vehicle.plate}</span>
              </div>
              {vehicle.vin ? (
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">VIN {vehicle.vin}</div>
              ) : null}
            </section>
          ) : null}

          {photos.length > 0 ? (
            <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-3">
                Galería ({photos.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((p, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    src={p.url}
                    alt={p.stepLabel}
                    title={p.stepLabel}
                    className="aspect-square w-full rounded-xl border border-zinc-200 object-cover"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "ok" | "bad";
}) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "bad"
        ? "text-brand-red-700"
        : "text-zinc-900";
  return (
    <div className="rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-black tabular-nums ${toneCls}`}>{value}</div>
      {helper ? <div className="text-[11px] text-zinc-500 mt-0.5">{helper}</div> : null}
    </div>
  );
}

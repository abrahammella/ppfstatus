import { notFound } from "next/navigation";
import Link from "next/link";
import { repos } from "@/lib/repositories";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  ServiceTypeSchema,
  TIER_LABELS,
  type CatalogItem,
  type Service,
  type Ticket,
  type Vehicle,
} from "@/lib/schemas";
import {
  STAGE_LABELS_SHORT,
  STEPS,
  progressPercent,
  type StepKey,
} from "@/lib/flow/ppf-stages";
import { StageBadge } from "@/components/ticket/stage-badge";
import {
  ClientDetailHeaderActions,
  VehicleListActions,
} from "../client-detail-actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<ReturnType<typeof ServiceTypeSchema.parse>, string> = {
  PPF: "PPF",
  CeramicCoating: "Ceramic Coating",
  Both: "PPF + Ceramic Coating",
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function fmtDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString(
    "es-DO",
    withTime
      ? {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { day: "numeric", month: "long", year: "numeric" },
  );
}

function relativeFromNow(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / DAY);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(days / 365);
  return `hace ${years} ${years === 1 ? "año" : "años"}`;
}

function getItemsForService(
  s: Service,
  ticketMap: Map<string, Ticket>,
  catalogMap: Map<string, CatalogItem>,
): CatalogItem[] {
  const ids = s.catalogItemIds ?? ticketMap.get(s.ticketId)?.catalogItemIds ?? [];
  return ids
    .map((id) => catalogMap.get(id))
    .filter((i): i is CatalogItem => Boolean(i));
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, vehicles, services, allTickets, users, catalog] = await Promise.all([
    repos.clients.findById(id),
    repos.vehicles.listByClient(id),
    repos.services.listByClient(id),
    repos.tickets.list(),
    repos.users.list(),
    repos.catalog.list(),
  ]);
  if (!client) notFound();

  const sortedServices = [...services].sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
  const vehicleMap = new Map<string, Vehicle>(vehicles.map((v) => [v.id, v]));
  const ticketMap = new Map<string, Ticket>(allTickets.map((t) => [t.id, t]));
  const catalogMap = new Map<string, CatalogItem>(catalog.map((c) => [c.id, c]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  const clientTickets = allTickets.filter((t) => t.clientId === id);
  const activeTickets = clientTickets
    .filter((t) => t.status !== "completado")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // Aggregate stats
  const totalUsd = services.reduce((sum, s) => {
    const items = getItemsForService(s, ticketMap, catalogMap);
    return sum + items.reduce((acc, i) => acc + (i.priceUsd ?? 0), 0);
  }, 0);

  // Top items used by this client (frequency across all their services)
  const itemFreq = new Map<string, number>();
  for (const s of services) {
    for (const item of getItemsForService(s, ticketMap, catalogMap)) {
      itemFreq.set(item.id, (itemFreq.get(item.id) ?? 0) + 1);
    }
  }
  const topItems = [...itemFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ item: catalogMap.get(id)!, count }))
    .filter((x) => x.item);

  // Per-vehicle stats
  const vehicleStats = vehicles.map((v) => {
    const vServices = services.filter((s) => s.vehicleId === v.id);
    const last = vServices.reduce<string | null>(
      (acc, s) => (acc === null || s.completedAt > acc ? s.completedAt : acc),
      null,
    );
    const vUsd = vServices.reduce(
      (sum, s) =>
        sum +
        getItemsForService(s, ticketMap, catalogMap).reduce(
          (a, i) => a + (i.priceUsd ?? 0),
          0,
        ),
      0,
    );
    return { vehicle: v, count: vServices.length, lastAt: last, usd: vUsd };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="-mt-2">
        <Link
          href="/clientes"
          className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700"
        >
          ← Clientes
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mt-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
              <span className="h-px w-6 bg-brand-red-600" /> Ficha de cliente
            </p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900 flex items-center gap-3 flex-wrap">
              {client.fullName}
              {client.tier ? (
                <span
                  className={
                    client.tier === "premier"
                      ? "inline-flex items-center rounded-full bg-brand-yellow-300 text-zinc-900 border border-brand-yellow-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                      : client.tier === "deluxe"
                        ? "inline-flex items-center rounded-full bg-zinc-900 text-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                        : "inline-flex items-center rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                  }
                >
                  {TIER_LABELS[client.tier]}
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              cliente desde {fmtDate(client.createdAt)} · {relativeFromNow(client.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/tickets/nuevo?clientId=${client.id}`}
              className="inline-flex items-center rounded-xl bg-brand-red-600 text-white text-sm font-bold uppercase tracking-wide px-4 py-2 hover:bg-brand-red-700 transition shadow-[0_10px_30px_-10px_oklch(0.56_0.23_25/0.55)]"
            >
              + Nuevo ticket
            </Link>
            <ClientDetailHeaderActions
              client={{
                id: client.id,
                fullName: client.fullName,
                phone: client.phone,
                email: client.email,
                notes: client.notes,
                tier: client.tier,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Servicios" value={String(services.length)} />
        <Stat label="Vehículos" value={String(vehicles.length)} />
        <Stat
          label="Gasto acumulado"
          value={totalUsd > 0 ? `US$${totalUsd.toLocaleString("en-US")}` : "—"}
          helper={totalUsd > 0 ? "Suma de items con precio" : undefined}
        />
        <Stat
          label="Última visita"
          value={
            client.lastVisitAt
              ? fmtDate(client.lastVisitAt)
              : sortedServices[0]
                ? fmtDate(sortedServices[0].completedAt)
                : "Nunca"
          }
          helper={
            client.lastVisitAt
              ? relativeFromNow(client.lastVisitAt)
              : sortedServices[0]
                ? relativeFromNow(sortedServices[0].completedAt)
                : undefined
          }
          tone={activeTickets.length > 0 ? "ok" : "neutral"}
        />
      </div>

      {/* Contact info + top services */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="text-base font-black uppercase tracking-tight text-zinc-900 mb-4">
            Datos de contacto
          </h2>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Nombre completo" value={client.fullName} />
            <Field label="Teléfono" value={client.phone} mono />
            <Field label="Email" value={client.email ?? "—"} mono={Boolean(client.email)} />
            <Field
              label="Cliente desde"
              value={fmtDate(client.createdAt)}
              helper={relativeFromNow(client.createdAt)}
            />
            {client.notes ? (
              <div className="sm:col-span-2 mt-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1">
                  Notas internas
                </div>
                <div className="text-sm text-zinc-700 italic bg-zinc-50/70 border border-zinc-100 rounded-xl px-4 py-3">
                  {client.notes}
                </div>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-3xl bg-brand-black text-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 size-48 rounded-full brand-glow blur-3xl opacity-70 pointer-events-none" />
          <div className="relative">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">
              Servicios más frecuentes
            </h2>
            {topItems.length === 0 ? (
              <div className="text-sm text-zinc-500 italic">
                Aún sin servicios registrados.
              </div>
            ) : (
              <ul className="space-y-2.5">
                {topItems.map(({ item, count }) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{item.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                        {CATEGORY_LABELS[item.category]}
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-red-600 text-white text-[11px] font-black tabular-nums px-2.5 py-0.5 shrink-0">
                      ×{count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Active tickets */}
      {activeTickets.length > 0 ? (
        <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
              Tickets activos
            </h2>
            <span className="text-[11px] font-bold uppercase rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-100 px-2.5 py-0.5">
              {activeTickets.length} en proceso
            </span>
          </div>
          <ul className="space-y-2.5">
            {activeTickets.map((t) => {
              const v = vehicleMap.get(t.vehicleId);
              const completedKeys = new Set<StepKey>(
                t.steps.filter((s) => s.completed).map((s) => s.key as StepKey),
              );
              const pct = progressPercent(t.isOfferVehicle, completedKeys);
              const items = (t.catalogItemIds ?? [])
                .map((id) => catalogMap.get(id))
                .filter((i): i is CatalogItem => Boolean(i));
              return (
                <li
                  key={t.id}
                  className="rounded-2xl border border-zinc-200 hover:border-brand-red-200 transition p-4"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="text-sm font-bold text-zinc-900 hover:text-brand-red-700"
                      >
                        {v ? `${v.brand} ${v.model} ${v.year}` : "Vehículo"}
                      </Link>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Creado {fmtDate(t.createdAt, true)} · ETA {fmtDate(t.etaAt, true)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StageBadge stage={t.status} />
                      <span className="text-[11px] font-bold tabular-nums text-zinc-700">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-red-500 to-brand-red-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {items.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {items.slice(0, 6).map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-700 px-2 py-0.5 text-[10px] font-semibold"
                        >
                          {item.name}
                        </span>
                      ))}
                      {items.length > 6 ? (
                        <span className="text-[10px] text-zinc-400">+{items.length - 6}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <Link
                    href={`/tickets/${t.id}`}
                    className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700 mt-3 inline-flex items-center gap-1"
                  >
                    Ver ticket →
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Vehicles with their service history */}
      <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
        <VehicleListActions
          clientId={client.id}
          vehicles={vehicles.map((v) => ({
            id: v.id,
            clientId: v.clientId,
            brand: v.brand,
            model: v.model,
            year: v.year,
            plate: v.plate,
            color: v.color,
            vin: v.vin,
          }))}
        />
        {vehicles.length > 0 ? (
          <div className="mt-5 space-y-3">
            {vehicleStats.map(({ vehicle: v, count, lastAt, usd }) => {
              const vServices = sortedServices.filter((s) => s.vehicleId === v.id);
              return (
                <details
                  key={v.id}
                  className="group rounded-2xl border border-zinc-200/80 bg-zinc-50/40 open:bg-white open:border-zinc-300 transition"
                  open={vehicles.length === 1}
                >
                  <summary className="cursor-pointer px-4 py-3 flex items-center justify-between gap-3 list-none">
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 truncate">
                        {v.brand} {v.model} {v.year}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {v.color} · placa <span className="font-mono">{v.plate}</span>
                        {v.vin ? <> · VIN <span className="font-mono">{v.vin}</span></> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-600">
                      <span className="tabular-nums">
                        {count} servicio{count === 1 ? "" : "s"}
                      </span>
                      {usd > 0 ? (
                        <span className="tabular-nums font-bold text-zinc-800">US${usd}</span>
                      ) : null}
                      {lastAt ? (
                        <span className="hidden sm:inline">
                          · últ. {fmtDate(lastAt)}
                        </span>
                      ) : null}
                      <span className="text-zinc-400 group-open:rotate-180 transition">▾</span>
                    </div>
                  </summary>
                  {vServices.length === 0 ? (
                    <div className="px-4 pb-4 text-xs text-zinc-500 italic">
                      Este vehículo aún no tiene servicios registrados.
                    </div>
                  ) : (
                    <ol className="px-4 pb-4 space-y-3">
                      {vServices.map((s) => {
                        const items = getItemsForService(s, ticketMap, catalogMap);
                        const sUsd = items.reduce((acc, i) => acc + (i.priceUsd ?? 0), 0);
                        return (
                          <li
                            key={s.id}
                            className="rounded-xl border border-zinc-200 bg-white p-3"
                          >
                            <div className="flex items-baseline justify-between gap-3 flex-wrap">
                              <Link
                                href={`/servicios/${s.id}`}
                                className="text-sm font-semibold text-zinc-900 hover:text-brand-red-700"
                              >
                                {TYPE_LABEL[s.type]}
                              </Link>
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                {sUsd > 0 ? (
                                  <span className="tabular-nums font-bold text-zinc-700">
                                    US${sUsd}
                                  </span>
                                ) : null}
                                <span>{fmtDate(s.completedAt, true)}</span>
                              </div>
                            </div>
                            {items.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {items.map((item) => (
                                  <span
                                    key={item.id}
                                    className="inline-flex items-center rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-100 px-2 py-0.5 text-[10px] font-semibold"
                                  >
                                    {item.name}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            {s.notes ? (
                              <div className="text-xs text-zinc-600 mt-2 italic">{s.notes}</div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </details>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* Full service history (timeline) */}
      <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
            Historial completo de servicios
          </h2>
          <span className="text-[11px] font-bold uppercase rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-0.5">
            {sortedServices.length} en total
          </span>
        </div>
        {sortedServices.length === 0 ? (
          <div className="text-sm text-zinc-500">Sin servicios registrados todavía.</div>
        ) : (
          <ol className="relative ml-2 space-y-6 border-l border-zinc-200 pl-5">
            {sortedServices.map((s) => {
              const v = vehicleMap.get(s.vehicleId);
              const items = getItemsForService(s, ticketMap, catalogMap);
              const itemsByCat = CATEGORY_ORDER.map((cat) => ({
                category: cat,
                items: items.filter((i) => i.category === cat),
              })).filter((g) => g.items.length > 0);
              const sUsd = items.reduce((sum, i) => sum + (i.priceUsd ?? 0), 0);

              const ticket = ticketMap.get(s.ticketId);
              const photos = ticket
                ? ticket.steps.filter((st) => st.photoUrl).map((st) => ({
                    url: st.photoUrl as string,
                    label: STEPS.find((d) => d.key === st.key)?.label ?? st.key,
                  }))
                : [];
              const completedSteps = ticket
                ? ticket.steps.filter((st) => st.completed)
                : [];

              return (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[27px] top-1 size-4 rounded-full bg-brand-red-500 ring-4 ring-white flex items-center justify-center text-white text-[9px] font-black">
                    ✓
                  </span>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link
                          href={`/servicios/${s.id}`}
                          className="text-base font-black text-zinc-900 hover:text-brand-red-700"
                        >
                          {TYPE_LABEL[s.type]}
                          {v ? (
                            <span className="text-zinc-500 font-semibold">
                              {" · "}
                              {v.brand} {v.model} {v.year}
                            </span>
                          ) : null}
                        </Link>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {fmtDate(s.completedAt, true)} · {relativeFromNow(s.completedAt)}
                          {ticket && ticket.completedAt && ticket.createdAt
                            ? ` · lead time ${Math.round(
                                (new Date(ticket.completedAt).getTime() -
                                  new Date(ticket.createdAt).getTime()) /
                                  HOUR,
                              )}h`
                            : null}
                        </div>
                      </div>
                      {sUsd > 0 ? (
                        <div className="text-right">
                          <div className="text-lg font-black text-zinc-900 tabular-nums">
                            US${sUsd}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                            valor
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {itemsByCat.length > 0 ? (
                      <div className="mt-3 space-y-1.5">
                        {itemsByCat.map((g) => (
                          <div key={g.category} className="flex flex-wrap gap-1 items-baseline">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mr-1">
                              {CATEGORY_LABELS[g.category]}
                            </span>
                            {g.items.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-100 px-2 py-0.5 text-[10px] font-semibold"
                              >
                                {item.name}
                                {typeof item.priceUsd === "number" ? (
                                  <span className="ml-1 text-zinc-500 tabular-nums">
                                    US${item.priceUsd}
                                  </span>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {completedSteps.length > 0 ? (
                      <div className="mt-3 text-[11px] text-zinc-600">
                        <span className="font-bold uppercase tracking-wide text-zinc-500">
                          Recorrido:
                        </span>{" "}
                        {completedSteps
                          .slice(-3)
                          .map((st) => {
                            const def = STEPS.find((d) => d.key === st.key);
                            const who = st.completedBy ? userMap.get(st.completedBy) : null;
                            return who && def ? `${def.label} (${who.name})` : def?.label ?? st.key;
                          })
                          .join(" · ")}
                        {completedSteps.length > 3 ? ` · +${completedSteps.length - 3} más` : ""}
                      </div>
                    ) : null}

                    {photos.length > 0 ? (
                      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                        {photos.slice(0, 5).map((p, i) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={i}
                            src={p.url}
                            alt={p.label}
                            title={p.label}
                            className="size-16 rounded-lg border border-zinc-200 object-cover shrink-0"
                          />
                        ))}
                        {photos.length > 5 ? (
                          <div className="size-16 rounded-lg border border-zinc-200 bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                            +{photos.length - 5}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {s.notes ? (
                      <div className="text-xs text-zinc-600 mt-3 bg-white border border-zinc-200 rounded-lg px-3 py-2">
                        <span className="font-bold uppercase tracking-wide text-zinc-500 text-[10px]">
                          Notas:
                        </span>{" "}
                        {s.notes}
                      </div>
                    ) : null}

                    <Link
                      href={`/servicios/${s.id}`}
                      className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700 mt-3 inline-flex items-center gap-1"
                    >
                      Ver detalle completo →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
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
  tone?: "neutral" | "ok";
}) {
  const toneCls = tone === "ok" ? "text-emerald-700" : "text-zinc-900";
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

function Field({
  label,
  value,
  helper,
  mono,
}: {
  label: string;
  value: string;
  helper?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</dt>
      <dd
        className={
          mono
            ? "text-sm text-zinc-900 mt-0.5 font-mono"
            : "text-sm text-zinc-900 mt-0.5 font-medium"
        }
      >
        {value}
      </dd>
      {helper ? <div className="text-[11px] text-zinc-400 mt-0.5">{helper}</div> : null}
    </div>
  );
}

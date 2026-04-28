import { notFound } from "next/navigation";
import Link from "next/link";
import { getEnrichedTicket } from "@/lib/queries";
import { repos } from "@/lib/repositories";
import { TicketChecklist } from "@/components/ticket/ticket-checklist";
import { StageBadge } from "@/components/ticket/stage-badge";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { progressPercent, ROLE_LABELS } from "@/lib/flow/ppf-stages";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/schemas";
import { completeStepAction } from "@/app/(employee)/ticket/[id]/actions";
import { SectionCard } from "@/components/dashboard/section-card";
import { ReassignButton } from "./reassign-modal";
import { CommentsThread } from "@/components/ticket/comments-thread";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ticket, catalog, users, session] = await Promise.all([
    getEnrichedTicket(id),
    repos.catalog.list(),
    repos.users.list(),
    getSession(),
  ]);
  if (!ticket) notFound();

  const tecnicos = users
    .filter((u) => u.role === "tecnico" && u.active)
    .map((u) => ({ id: u.id, name: u.name }));
  const especialistas = users
    .filter((u) => u.role === "especialista" && u.active)
    .map((u) => ({ id: u.id, name: u.name }));
  const qcs = users
    .filter((u) => u.role === "qc" && u.active)
    .map((u) => ({ id: u.id, name: u.name }));

  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const pct = progressPercent(ticket.isOfferVehicle, completed);
  const completedCount = completed.size;
  const totalSteps = ticket.steps.length;

  const selectedItems = (ticket.catalogItemIds ?? [])
    .map((id) => catalog.find((c) => c.id === id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));
  const itemsByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: selectedItems.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2">
        <Link
          href="/tablero"
          className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700"
        >
          ← Tablero
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mt-3">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
              <span className="h-px w-6 bg-brand-red-600" /> Ticket {ticket.id}
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

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" delay={0.1}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
                Subprocesos
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {completedCount} de {totalSteps} pasos completados.
              </p>
            </div>
          </div>
          <TicketChecklist
            ticket={ticket}
            role="admin"
            actorId="u_admin"
            completeAction={completeStepAction}
          />
        </SectionCard>

        <SectionCard delay={0.18} className="space-y-5">
          <Section title="Cliente">
            <Link
              href={`/clientes/${ticket.client?.id ?? ""}`}
              className="block text-sm font-semibold text-zinc-900 hover:text-brand-red-700"
            >
              {ticket.client?.fullName ?? "—"}
            </Link>
            <div className="text-xs text-zinc-500 font-mono mt-0.5">{ticket.client?.phone}</div>
            {ticket.client?.email ? (
              <div className="text-xs text-zinc-500 font-mono">{ticket.client.email}</div>
            ) : null}
          </Section>

          <Section title="Servicio">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-zinc-900 text-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                {ticket.serviceType === "Both" ? "PPF + CC" : ticket.serviceType}
              </span>
              {ticket.isOfferVehicle ? (
                <span className="inline-flex items-center rounded-full bg-brand-yellow-300 text-zinc-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                  Oferta
                </span>
              ) : null}
            </div>
            {ticket.isOfferVehicle ? (
              <div className="text-[11px] text-zinc-500 mt-1.5">
                Incluye paso a JS Autotuning (laminado + alfombras bandeja).
              </div>
            ) : null}

            {itemsByCategory.length > 0 ? (
              <div className="mt-3 space-y-2">
                {itemsByCategory.map((g) => (
                  <div key={g.category}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1">
                      {CATEGORY_LABELS[g.category]}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {g.items.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center rounded-full bg-brand-red-50 text-brand-red-700 border border-brand-red-100 px-2 py-0.5 text-[11px] font-semibold"
                        >
                          {item.name}
                          {typeof item.priceUsd === "number" ? (
                            <span className="ml-1 text-zinc-500 tabular-nums">
                              · US${item.priceUsd}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-zinc-400 italic mt-2">
                Sin servicios del catálogo seleccionados.
              </div>
            )}
          </Section>

          <Section title="Asignaciones">
            <div className="text-xs space-y-1.5">
              {(["tecnico", "especialista", "qc"] as const).map((r) => {
                const u =
                  r === "tecnico"
                    ? ticket.tecnico
                    : r === "especialista"
                      ? ticket.especialista
                      : ticket.qc;
                return (
                  <div key={r} className="flex justify-between gap-4">
                    <span className="text-zinc-500">{ROLE_LABELS[r]}</span>
                    <span className={u ? "text-zinc-900 font-medium" : "text-zinc-400 italic"}>
                      {u?.name ?? "Sin asignar"}
                    </span>
                  </div>
                );
              })}
            </div>
            <ReassignButton
              ticketId={ticket.id}
              current={{
                assignedTecnicoId: ticket.assignedTecnicoId,
                assignedEspecialistaId: ticket.assignedEspecialistaId,
                assignedQcId: ticket.assignedQcId,
              }}
              tecnicos={tecnicos}
              especialistas={especialistas}
              qcs={qcs}
            />
          </Section>

          <Section title="Tiempos">
            <div className="text-xs space-y-1.5">
              <Row label="Creado" value={new Date(ticket.createdAt).toLocaleString("es-DO")} />
              <Row label="ETA" value={new Date(ticket.etaAt).toLocaleString("es-DO")} />
              {ticket.completedAt ? (
                <Row
                  label="Completado"
                  value={new Date(ticket.completedAt).toLocaleString("es-DO")}
                />
              ) : null}
            </div>
          </Section>

          <Section title="Link público del cliente">
            <code className="text-[10px] text-zinc-600 break-all bg-zinc-50 rounded-lg px-2 py-1.5 block border border-zinc-200 font-mono">
              /status/{ticket.publicToken}
            </code>
            <Link
              href={`/status/${ticket.publicToken}`}
              target="_blank"
              className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700 inline-flex items-center gap-1 mt-2"
            >
              Abrir en nueva pestaña →
            </Link>
          </Section>
        </SectionCard>
      </div>

      <SectionCard delay={0.24}>
        <h2 className="text-base font-black uppercase tracking-tight text-zinc-900 mb-4">
          Comentarios del equipo
        </h2>
        <CommentsThread
          ticketId={ticket.id}
          comments={ticket.comments ?? []}
          authors={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))}
          currentUserId={session?.sub ?? ""}
          currentUserRole={session?.role ?? "admin"}
          canComment={true}
        />
      </SectionCard>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-900 font-medium">{value}</span>
    </div>
  );
}

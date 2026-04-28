import { notFound } from "next/navigation";
import Link from "next/link";
import { getEnrichedTicket } from "@/lib/queries";
import { TicketChecklist } from "@/components/ticket/ticket-checklist";
import { StageBadge } from "@/components/ticket/stage-badge";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { progressPercent, ROLE_LABELS } from "@/lib/flow/ppf-stages";
import { completeStepAction } from "@/app/(employee)/ticket/[id]/actions";

export const dynamic = "force-dynamic";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getEnrichedTicket(id);
  if (!ticket) notFound();

  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const pct = progressPercent(ticket.isOfferVehicle, completed);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <Link href="/dashboard" className="text-sm text-brand-red-600 hover:text-brand-red-700">
            ← Volver al dashboard
          </Link>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mt-2">
            {ticket.vehicle?.brand} {ticket.vehicle?.model} {ticket.vehicle?.year}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {ticket.client?.fullName} · {ticket.vehicle?.color} · placa {ticket.vehicle?.plate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StageBadge stage={ticket.status} />
          <ProgressPill percent={pct} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Subprocesos</h2>
          <TicketChecklist ticket={ticket} role="admin" actorId="u_admin" completeAction={completeStepAction} />
        </div>

        <aside className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm space-y-4">
          <Section title="Cliente">
            <div className="text-sm text-zinc-900">{ticket.client?.fullName}</div>
            <div className="text-xs text-zinc-500">{ticket.client?.phone}</div>
            {ticket.client?.email ? (
              <div className="text-xs text-zinc-500">{ticket.client.email}</div>
            ) : null}
          </Section>
          <Section title="Servicio">
            <div className="text-sm text-zinc-900">
              {ticket.serviceType === "Both" ? "PPF + Ceramic Coating" : ticket.serviceType}
            </div>
            <div className="text-xs text-zinc-500">
              Vehículo de oferta: {ticket.isOfferVehicle ? "Sí" : "No"}
            </div>
          </Section>
          <Section title="Asignaciones">
            <div className="text-xs text-zinc-500 space-y-1">
              {(["tecnico", "especialista", "qc"] as const).map((r) => {
                const u = r === "tecnico" ? ticket.tecnico : r === "especialista" ? ticket.especialista : ticket.qc;
                return (
                  <div key={r} className="flex justify-between gap-4">
                    <span>{ROLE_LABELS[r]}:</span>
                    <span className="text-zinc-900">{u?.name ?? "Sin asignar"}</span>
                  </div>
                );
              })}
            </div>
          </Section>
          <Section title="Tiempos">
            <div className="text-xs text-zinc-500 space-y-1">
              <Row label="Creado" value={new Date(ticket.createdAt).toLocaleString("es-DO")} />
              <Row label="ETA" value={new Date(ticket.etaAt).toLocaleString("es-DO")} />
              {ticket.completedAt ? (
                <Row label="Completado" value={new Date(ticket.completedAt).toLocaleString("es-DO")} />
              ) : null}
            </div>
          </Section>
          <Section title="Link público para el cliente">
            <code className="text-[10px] text-zinc-600 break-all bg-zinc-50 rounded-lg px-2 py-1 block border border-zinc-200">
              /status/{ticket.publicToken}
            </code>
            <Link
              href={`/status/${ticket.publicToken}`}
              target="_blank"
              className="text-xs text-brand-red-600 hover:text-brand-red-700 inline-block mt-2"
            >
              Abrir en nueva pestaña →
            </Link>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}:</span>
      <span className="text-zinc-900">{value}</span>
    </div>
  );
}

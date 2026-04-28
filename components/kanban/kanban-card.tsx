"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ProgressPill } from "@/components/ticket/progress-pill";
import { progressPercent } from "@/lib/flow/ppf-stages";
import type { EnrichedTicket } from "@/lib/queries";
import clsx from "clsx";

export function KanbanCard({ ticket, draggable }: { ticket: EnrichedTicket; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    disabled: !draggable,
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const pct = progressPercent(ticket.isOfferVehicle, completed);
  const eta = new Date(ticket.etaAt);
  const etaLabel = eta.toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "group rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-sm hover:shadow-md transition",
        draggable ? "cursor-grab active:cursor-grabbing" : "",
        isDragging ? "opacity-60 ring-2 ring-brand-red-500" : "",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">
            {ticket.vehicle ? `${ticket.vehicle.brand} ${ticket.vehicle.model}` : "—"}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {ticket.client?.fullName ?? "Sin cliente"} · {ticket.vehicle?.year ?? ""}{" "}
            {ticket.vehicle?.color ?? ""}
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-zinc-100 text-zinc-600 px-2 py-0.5 whitespace-nowrap">
          {ticket.serviceType === "Both" ? "PPF + CC" : ticket.serviceType}
        </span>
      </div>

      <div className="mt-3"><ProgressPill percent={pct} /></div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex -space-x-1.5">
          {[ticket.tecnico, ticket.especialista, ticket.qc]
            .filter((u): u is NonNullable<typeof u> => Boolean(u))
            .map((u) => (
              <span
                key={u.id}
                title={u.name}
                className="size-6 rounded-full ring-2 ring-white bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-[10px] text-white flex items-center justify-center font-bold"
              >
                {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
            ))}
        </div>
        <span>ETA {etaLabel}</span>
      </div>

      <Link
        href={`/tickets/${ticket.id}`}
        className="mt-3 inline-flex text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700"
      >
        Ver detalle →
      </Link>
    </div>
  );
}

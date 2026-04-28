"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { KanbanCard } from "./kanban-card";
import { STAGES, STAGE_LABELS, type Stage } from "@/lib/flow/ppf-stages";
import type { EnrichedTicket } from "@/lib/queries";
import clsx from "clsx";

const VISIBLE_STAGES: Stage[] = ["recepcion", "lavado", "aplicacion", "qc", "entrega"];

const COLUMN_HEAD_BG: Record<Stage, string> = {
  recepcion: "from-zinc-100 to-zinc-50",
  lavado: "from-amber-100 to-amber-50",
  aplicacion: "from-brand-red-100 to-brand-red-50",
  qc: "from-violet-100 to-violet-50",
  entrega: "from-emerald-100 to-emerald-50",
  completado: "from-zinc-100 to-zinc-50",
};

function Column({
  stage,
  tickets,
  draggable,
}: {
  stage: Stage;
  tickets: EnrichedTicket[];
  draggable: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex-shrink-0 w-72 lg:w-80 flex flex-col rounded-3xl bg-white/70 backdrop-blur-sm border border-zinc-200/60 transition",
        isOver ? "ring-2 ring-brand-red-500 bg-white" : "",
      )}
    >
      <div
        className={clsx(
          "px-4 py-3 rounded-t-3xl bg-gradient-to-br border-b border-white/60 flex items-center justify-between",
          COLUMN_HEAD_BG[stage],
        )}
      >
        <div className="text-sm font-semibold text-zinc-800">{STAGE_LABELS[stage]}</div>
        <div className="text-xs font-medium text-zinc-700 bg-white/70 rounded-full px-2 py-0.5">
          {tickets.length}
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 min-h-32 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="text-xs text-zinc-400 text-center py-8 border-2 border-dashed border-zinc-200 rounded-xl">
            Sin tickets
          </div>
        ) : (
          tickets.map((t) => <KanbanCard key={t.id} ticket={t} draggable={draggable} />)
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  tickets: initialTickets,
  canDrag,
  moveTicketAction,
}: {
  tickets: EnrichedTicket[];
  canDrag: boolean;
  moveTicketAction: (id: string, target: Stage) => Promise<void>;
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const grouped: Record<Stage, EnrichedTicket[]> = {
    recepcion: [],
    lavado: [],
    aplicacion: [],
    qc: [],
    entrega: [],
    completado: [],
  };
  for (const t of tickets) grouped[t.status].push(t);

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const target = e.over.id as Stage;
    const id = e.active.id as string;
    if (!STAGES.includes(target)) return;
    const t = tickets.find((x) => x.id === id);
    if (!t || t.status === target) return;
    setTickets((prev) => prev.map((x) => (x.id === id ? { ...x, status: target } : x)));
    startTransition(async () => {
      try {
        await moveTicketAction(id, target);
      } catch {
        setTickets((prev) => prev.map((x) => (x.id === id ? { ...x, status: t.status } : x)));
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {VISIBLE_STAGES.map((stage) => (
          <Column key={stage} stage={stage} tickets={grouped[stage]} draggable={canDrag} />
        ))}
      </div>
    </DndContext>
  );
}

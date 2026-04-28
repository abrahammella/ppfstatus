import Link from "next/link";
import { listEnrichedTickets } from "@/lib/queries";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { moveTicketStage } from "./actions";

export const dynamic = "force-dynamic";

export default async function TableroPage() {
  const tickets = await listEnrichedTickets();
  const active = tickets.filter((t) => t.status !== "completado");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
            <span className="h-px w-6 bg-brand-red-600" /> Operación
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Tablero
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {active.length} ticket{active.length === 1 ? "" : "s"} activo{active.length === 1 ? "" : "s"} ·
            arrastra una tarjeta entre columnas para cambiar la etapa.
          </p>
        </div>
        <Link
          href="/tickets/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red-600 text-white text-sm font-bold uppercase tracking-wide px-4 py-2.5 hover:bg-brand-red-700 transition shadow-[0_10px_30px_-10px_oklch(0.56_0.23_25/0.55)]"
        >
          <span className="text-base leading-none">+</span> Nuevo ticket
        </Link>
      </div>

      <KanbanBoard tickets={active} canDrag moveTicketAction={moveTicketStage} />
    </div>
  );
}

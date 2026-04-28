import type { Stage } from "@/lib/flow/ppf-stages";
import { STAGE_LABELS_SHORT } from "@/lib/flow/ppf-stages";
import clsx from "clsx";

const COLORS: Record<Stage, string> = {
  recepcion: "bg-zinc-100 text-zinc-700 border-zinc-200",
  lavado: "bg-amber-50 text-amber-700 border-amber-200",
  aplicacion: "bg-brand-red-50 text-brand-red-700 border-brand-red-100",
  qc: "bg-violet-50 text-violet-700 border-violet-200",
  entrega: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completado: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

export function StageBadge({ stage, className, short = false }: { stage: Stage; className?: string; short?: boolean }) {
  const label = short ? STAGE_LABELS_SHORT[stage] : STAGE_LABELS_SHORT[stage];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        COLORS[stage],
        className,
      )}
    >
      {label}
    </span>
  );
}

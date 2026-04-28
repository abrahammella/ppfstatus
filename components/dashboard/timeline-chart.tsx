"use client";

import { motion } from "framer-motion";
import type { DailyBucket } from "@/lib/analytics";

export function TimelineChart({ buckets }: { buckets: DailyBucket[] }) {
  const maxCreated = Math.max(1, ...buckets.map((b) => b.created));
  const maxDelivered = Math.max(1, ...buckets.map((b) => b.delivered));
  const max = Math.max(maxCreated, maxDelivered);
  const totalCreated = buckets.reduce((s, b) => s + b.created, 0);
  const totalDelivered = buckets.reduce((s, b) => s + b.delivered, 0);

  return (
    <div>
      <div className="flex items-center gap-4 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1.5 text-zinc-700">
          <span className="size-2.5 rounded-sm bg-brand-red-600" /> Creados ({totalCreated})
        </span>
        <span className="inline-flex items-center gap-1.5 text-zinc-700">
          <span className="size-2.5 rounded-sm bg-emerald-500" /> Entregados ({totalDelivered})
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 items-end h-32">
        {buckets.map((b, i) => {
          const cH = Math.max((b.created / max) * 100, b.created ? 4 : 0);
          const dH = Math.max((b.delivered / max) * 100, b.delivered ? 4 : 0);
          return (
            <div
              key={b.date}
              className="flex flex-col-reverse gap-0.5 h-full"
              title={`${b.date}: ${b.created} creados, ${b.delivered} entregados`}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${cH}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 * i }}
                className="w-full bg-brand-red-600 rounded-t-sm"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${dH}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 * i + 0.1 }}
                className="w-full bg-emerald-500 rounded-t-sm"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 text-[9px] text-zinc-400 tabular-nums text-center">
        {buckets.map((b, i) => (
          <span key={b.date}>{i === 0 || i === 7 || i === 13 ? b.date.slice(8) : ""}</span>
        ))}
      </div>
    </div>
  );
}

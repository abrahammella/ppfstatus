"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DailyBucket } from "@/lib/analytics";

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  return d.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
}

export function TimelineChart({ buckets }: { buckets: DailyBucket[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
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
        {hoverIdx !== null ? (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {fmtDate(buckets[hoverIdx].date)}
          </span>
        ) : null}
      </div>

      <div className="relative mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 items-end h-32">
        {buckets.map((b, i) => {
          const cH = Math.max((b.created / max) * 100, b.created ? 4 : 0);
          const dH = Math.max((b.delivered / max) * 100, b.delivered ? 4 : 0);
          const hovered = hoverIdx === i;
          return (
            <div
              key={b.date}
              className="relative h-full"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
            >
              {/* Hit area extends slightly larger for easier hover */}
              <div className="absolute -inset-x-0.5 inset-y-0 z-10" />

              {/* Highlight column */}
              {hovered ? (
                <motion.div
                  layoutId="hover-bar"
                  className="absolute -inset-x-0.5 inset-y-0 rounded-md bg-brand-red-500/10 ring-1 ring-brand-red-200 pointer-events-none"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              ) : null}

              <div className="relative flex flex-col-reverse gap-0.5 h-full">
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

              <AnimatePresence>
                {hovered ? (
                  <motion.div
                    key="tip"
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 min-w-[140px] rounded-xl bg-zinc-900 text-white shadow-2xl px-3 py-2 text-left ring-1 ring-white/10"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                      {fmtDate(b.date)}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-zinc-200">
                        <span className="size-2 rounded-sm bg-brand-red-500" /> Creados
                      </span>
                      <span className="font-bold tabular-nums">{b.created}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-zinc-200">
                        <span className="size-2 rounded-sm bg-emerald-500" /> Entregados
                      </span>
                      <span className="font-bold tabular-nums">{b.delivered}</span>
                    </div>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 size-2 bg-zinc-900 rotate-45 -mt-1" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
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

"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { STAGE_LABELS, STAGE_LABELS_SHORT, type Stage } from "@/lib/flow/ppf-stages";

const ORDER: Stage[] = ["recepcion", "lavado", "aplicacion", "qc", "entrega"];

export function StageBars({
  byStage,
  highlight,
}: {
  byStage: Record<Stage, number>;
  highlight: Stage | null;
}) {
  const [hover, setHover] = useState<Stage | null>(null);
  const max = Math.max(1, ...ORDER.map((s) => byStage[s]));

  return (
    <div className="grid grid-cols-5 gap-3">
      {ORDER.map((s, idx) => {
        const v = byStage[s];
        const pct = (v / max) * 100;
        const minHeight = v > 0 ? 6 : 0;
        const finalHeight = Math.max(pct, minHeight);
        const isPeak = highlight === s && v > 0;
        const hovered = hover === s;
        return (
          <Link
            key={s}
            href="/tablero"
            className="group flex flex-col items-center gap-2 outline-none"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover((cur) => (cur === s ? null : cur))}
            onFocus={() => setHover(s)}
            onBlur={() => setHover((cur) => (cur === s ? null : cur))}
          >
            <div
              className={
                "relative w-full h-32 rounded-2xl border overflow-hidden transition " +
                (hovered
                  ? "bg-zinc-100 border-zinc-300 ring-2 ring-brand-red-200"
                  : "bg-zinc-50 border-zinc-100")
              }
            >
              <motion.div
                initial={{ height: "0%" }}
                animate={{ height: `${finalHeight}%`, scale: hovered ? 1.02 : 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 + idx * 0.07 }}
                style={{ transformOrigin: "bottom" }}
                className={
                  isPeak
                    ? "absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-red-700 to-brand-red-500 rounded-b-2xl"
                    : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-700 to-zinc-500 rounded-b-2xl"
                }
              />
              <div className="absolute inset-x-0 top-2 text-center text-base font-black tabular-nums text-zinc-900">
                {v}
              </div>
              {isPeak ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + idx * 0.07 }}
                  className="absolute -top-1 right-1 text-[9px] font-bold uppercase tracking-wider text-brand-red-700 bg-brand-red-50 border border-brand-red-100 rounded-full px-1.5"
                >
                  pico
                </motion.div>
              ) : null}

              <AnimatePresence>
                {hovered ? (
                  <motion.div
                    key="tip"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-zinc-900 text-white shadow-2xl px-3 py-1.5 ring-1 ring-white/10 pointer-events-none whitespace-nowrap"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                      {STAGE_LABELS[s]}
                    </div>
                    <div className="text-xs font-bold">
                      {v} ticket{v === 1 ? "" : "s"} · ver tablero →
                    </div>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 size-2 bg-zinc-900 rotate-45 -mt-1" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div
              className={
                "text-[10px] font-bold uppercase tracking-wide text-center transition " +
                (hovered ? "text-brand-red-700" : "text-zinc-600")
              }
            >
              {STAGE_LABELS_SHORT[s]}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

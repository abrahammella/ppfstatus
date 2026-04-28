"use client";

import { motion } from "framer-motion";
import { STAGE_LABELS_SHORT, type Stage } from "@/lib/flow/ppf-stages";

const ORDER: Stage[] = ["recepcion", "lavado", "aplicacion", "qc", "entrega"];

export function StageBars({
  byStage,
  highlight,
}: {
  byStage: Record<Stage, number>;
  highlight: Stage | null;
}) {
  const max = Math.max(1, ...ORDER.map((s) => byStage[s]));
  return (
    <div className="grid grid-cols-5 gap-3">
      {ORDER.map((s, idx) => {
        const v = byStage[s];
        const pct = (v / max) * 100;
        const minHeight = v > 0 ? 6 : 0;
        const finalHeight = Math.max(pct, minHeight);
        const isPeak = highlight === s && v > 0;
        return (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className="relative w-full h-32 bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
              <motion.div
                initial={{ height: "0%" }}
                animate={{ height: `${finalHeight}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 + idx * 0.07 }}
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
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 text-center">
              {STAGE_LABELS_SHORT[s]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

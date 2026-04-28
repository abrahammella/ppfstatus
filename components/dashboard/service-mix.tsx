"use client";

import { motion } from "framer-motion";
import type { ServiceType } from "@/lib/schemas";

const LABELS: Record<ServiceType, string> = {
  PPF: "PPF",
  CeramicCoating: "Ceramic Coating",
  Both: "PPF + Ceramic",
};

const COLORS: Record<ServiceType, string> = {
  PPF: "bg-brand-red-600",
  CeramicCoating: "bg-zinc-800",
  Both: "bg-brand-yellow-400",
};

export function ServiceMix({ mix }: { mix: Record<ServiceType, number> }) {
  const total = mix.PPF + mix.CeramicCoating + mix.Both;
  if (total === 0) {
    return <div className="text-sm text-zinc-500">Sin servicios todavía.</div>;
  }
  const order: ServiceType[] = ["PPF", "CeramicCoating", "Both"];
  return (
    <div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-zinc-100">
        {order.map((k, i) => {
          const pct = (mix[k] / total) * 100;
          if (pct === 0) return null;
          return (
            <motion.div
              key={k}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.1 }}
              className={COLORS[k]}
              title={`${LABELS[k]}: ${mix[k]} (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {order.map((k, i) => {
          const pct = (mix[k] / total) * 100;
          return (
            <motion.li
              key={k}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.07 }}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-zinc-700">
                <span className={`size-3 rounded-sm ${COLORS[k]}`} />
                {LABELS[k]}
              </span>
              <span className="tabular-nums text-zinc-900 font-bold">
                {mix[k]} <span className="text-zinc-400 font-medium">· {pct.toFixed(0)}%</span>
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

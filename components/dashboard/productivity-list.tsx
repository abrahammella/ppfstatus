"use client";

import { motion } from "framer-motion";
import { ROLE_LABELS, type Role } from "@/lib/flow/ppf-stages";

export interface ProductivityRowProps {
  userId: string;
  name: string;
  role: Role;
  stepsCompleted: number;
  ticketsTouched: number;
}

export function ProductivityList({ rows }: { rows: ProductivityRowProps[] }) {
  if (rows.length === 0) {
    return <div className="text-sm text-zinc-500">Sin actividad en los últimos 30 días.</div>;
  }
  const max = rows[0].stepsCompleted || 1;

  return (
    <ul className="space-y-2">
      {rows.slice(0, 6).map((row, idx) => {
        const pct = (row.stepsCompleted / max) * 100;
        return (
          <motion.li
            key={row.userId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div className="w-7 text-zinc-400 font-bold text-xs tabular-nums text-right">
              #{idx + 1}
            </div>
            <div className="size-9 rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-white text-xs font-black flex items-center justify-center ring-1 ring-white shrink-0">
              {row.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-900 truncate">{row.name}</div>
              <div className="text-[11px] text-zinc-500">
                {ROLE_LABELS[row.role]} · {row.ticketsTouched} ticket
                {row.ticketsTouched === 1 ? "" : "s"}
              </div>
            </div>
            <div className="w-32 hidden md:block">
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.2 + idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-brand-red-500 to-brand-red-700"
                />
              </div>
            </div>
            <div className="text-sm font-black tabular-nums text-zinc-900 w-12 text-right">
              {row.stepsCompleted}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

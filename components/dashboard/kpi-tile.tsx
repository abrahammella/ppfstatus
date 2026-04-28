"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { AnimatedNumber } from "./animated-number";

export function KpiTile({
  label,
  value,
  numericValue,
  decimals = 0,
  unit,
  delta,
  deltaSuffix,
  helper,
  highlight = false,
  icon,
  index = 0,
}: {
  label: string;
  /** Pre-formatted fallback (used when numericValue is not provided or non-finite). */
  value: string;
  /** When provided, the tile animates a counter from 0 to this number. */
  numericValue?: number | null;
  decimals?: number;
  unit?: string;
  delta?: number;
  deltaSuffix?: string;
  helper?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
  /** Stagger index for entrance animation. */
  index?: number;
}) {
  const positive = (delta ?? 0) > 0;
  const negative = (delta ?? 0) < 0;
  const animatable =
    typeof numericValue === "number" && Number.isFinite(numericValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={clsx(
        "relative rounded-3xl p-5 ring-1 overflow-hidden cursor-default",
        highlight
          ? "bg-brand-black text-white ring-white/10"
          : "bg-white text-zinc-900 ring-zinc-200/80 shadow-sm hover:shadow-md transition-shadow",
      )}
    >
      {highlight ? (
        <motion.div
          aria-hidden
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.08 }}
          className="absolute -top-16 -right-10 size-44 rounded-full brand-glow blur-3xl pointer-events-none"
        />
      ) : null}
      <div className="relative flex items-center justify-between gap-2">
        <span
          className={clsx(
            "text-[10px] font-bold uppercase tracking-[0.18em]",
            highlight ? "text-zinc-400" : "text-zinc-500",
          )}
        >
          {label}
        </span>
        {icon ? (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "backOut", delay: 0.15 + index * 0.08 }}
            className={clsx(
              "size-8 rounded-xl flex items-center justify-center",
              highlight ? "bg-white/10 text-white" : "bg-brand-red-50 text-brand-red-700",
            )}
          >
            {icon}
          </motion.span>
        ) : null}
      </div>
      <div className="relative mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl lg:text-4xl font-black tabular-nums leading-none">
          {animatable ? (
            <AnimatedNumber value={numericValue as number} decimals={decimals} />
          ) : (
            value
          )}
        </span>
        {unit ? (
          <span className={clsx("text-sm font-bold", highlight ? "text-zinc-400" : "text-zinc-500")}>
            {unit}
          </span>
        ) : null}
      </div>
      <div className="relative mt-3 flex items-center justify-between text-[11px]">
        {typeof delta === "number" ? (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
            className={clsx(
              "inline-flex items-center gap-1 font-bold rounded-full px-2 py-0.5 border",
              positive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : negative
                  ? "bg-brand-red-50 text-brand-red-700 border-brand-red-100"
                  : highlight
                    ? "bg-white/5 text-zinc-400 border-white/10"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200",
            )}
          >
            {positive ? "▲" : negative ? "▼" : "•"} {Math.abs(delta)}
            {deltaSuffix ? deltaSuffix : ""}
          </motion.span>
        ) : (
          <span />
        )}
        {helper ? (
          <span className={clsx(highlight ? "text-zinc-500" : "text-zinc-400")}>{helper}</span>
        ) : null}
      </div>
    </motion.div>
  );
}

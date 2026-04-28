"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

/** Animated entrance for dashboard sections — fade-up with delay. */
export function SectionCard({
  children,
  className,
  delay = 0,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={clsx(
        "rounded-3xl p-5 relative overflow-hidden",
        dark
          ? "bg-brand-black text-white ring-1 ring-white/5"
          : "bg-white border border-zinc-200/80 shadow-sm",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

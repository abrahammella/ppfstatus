"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { STAGES, STAGE_LABELS, STAGE_LABELS_SHORT, type Stage } from "@/lib/flow/ppf-stages";

const VISIBLE_STAGES: Stage[] = ["recepcion", "lavado", "aplicacion", "qc", "entrega"];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const stepCircle: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -90 },
  show: { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 320, damping: 18 } },
};

export interface ServiceGroup {
  category: string;
  label: string;
  names: string[];
}

export interface AnimatedStatusProps {
  clientName: string;
  vehicleLine: string | null;
  status: Stage;
  percent: number;
  etaIso: string;
  completedAtIso: string | null;
  isCompleted: boolean;
  lastPhotoUrl: string | null;
  serviceGroups?: ServiceGroup[];
}

export function AnimatedStatus({
  clientName,
  vehicleLine,
  status,
  percent,
  etaIso,
  completedAtIso,
  isCompleted,
  lastPhotoUrl,
  serviceGroups = [],
}: AnimatedStatusProps) {
  const currentIdx = STAGES.indexOf(status);
  const dateIso = isCompleted ? completedAtIso ?? etaIso : etaIso;
  const dateLabel = new Date(dateIso).toLocaleString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full max-w-xl">
      {/* Logo above card */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 flex items-center justify-center gap-3"
      >
        <div className="relative size-10 rounded-xl bg-black ring-1 ring-white/15 overflow-hidden">
          <Image
            src="/brand/logojs.jpg"
            alt="JS Detailing Center"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-white text-sm font-black tracking-[0.2em]">JS DETAILING</div>
          <div className="text-brand-red-500 text-[9px] font-bold tracking-[0.4em] -mt-0.5">CENTER</div>
        </div>
      </motion.div>

      {/* Card with reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        whileHover={{ y: -2, transition: { duration: 0.3 } }}
        className="rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] border border-white/40 overflow-hidden"
      >
        {/* Status banner */}
        <div className="relative bg-brand-black text-white px-7 py-5 overflow-hidden">
          {/* Continuous breathing glow */}
          <motion.div
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.9, 1.08, 0.9] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-16 size-56 rounded-full brand-glow blur-3xl pointer-events-none"
          />

          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="relative flex items-center justify-between gap-4"
          >
            <motion.div variants={item}>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                {isCompleted ? "Trabajo completado" : "Estado actual"}
              </div>
              <div className="text-xl font-black uppercase tracking-tight mt-0.5">
                {STAGE_LABELS[status]}
              </div>
            </motion.div>
            <motion.div variants={item} className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Avance
              </div>
              <div className="text-2xl font-black tabular-nums mt-0.5 text-brand-red-500 flex items-baseline justify-end">
                <AnimatedNumber value={percent} duration={1.4} />
                <span>%</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Progress bar with shimmer */}
          <div className="relative mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="relative h-full bg-gradient-to-r from-brand-red-500 to-brand-red-700 overflow-hidden"
            >
              {/* Continuous sweeping shine */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: "easeInOut",
                  delay: 1.6,
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="px-7 py-7"
          style={{ ["--delay" as string]: "0.5s" }}
        >
          <motion.div variants={item}>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Hola</div>
            <motion.div
              className="text-2xl font-black uppercase text-zinc-900 leading-tight mt-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {clientName}
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="text-sm text-zinc-600 mt-2">
            {vehicleLine ?? "—"}
          </motion.div>

          {/* Animated stepper */}
          <motion.ol
            initial="hidden"
            animate="show"
            variants={{
              show: { transition: { staggerChildren: 0.09, delayChildren: 0.7 } },
            }}
            className="mt-7 grid grid-cols-5 gap-2"
          >
            {VISIBLE_STAGES.map((s, idx) => {
              const reached = idx <= currentIdx;
              const active = idx === currentIdx && !isCompleted;
              return (
                <motion.li
                  key={s}
                  variants={stepCircle}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="relative">
                    {/* Pulsing ring on active step */}
                    {active ? (
                      <motion.span
                        aria-hidden
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -inset-1 rounded-xl bg-brand-red-500"
                      />
                    ) : null}
                    <div
                      className={
                        active
                          ? "relative size-9 rounded-xl bg-brand-red-600 text-white text-sm font-black flex items-center justify-center ring-4 ring-brand-red-100"
                          : reached
                            ? "relative size-9 rounded-xl bg-zinc-900 text-white text-sm font-black flex items-center justify-center"
                            : "relative size-9 rounded-xl bg-zinc-100 text-zinc-400 text-sm font-bold flex items-center justify-center"
                      }
                    >
                      {reached && !active ? (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.7 + idx * 0.09, duration: 0.4, ease: "backOut" }}
                        >
                          ✓
                        </motion.span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                  </div>
                  <span
                    className={
                      reached
                        ? "text-[10px] font-bold uppercase tracking-wide text-zinc-700 leading-tight"
                        : "text-[10px] font-medium uppercase tracking-wide text-zinc-400 leading-tight"
                    }
                  >
                    {STAGE_LABELS_SHORT[s]}
                  </span>
                </motion.li>
              );
            })}
          </motion.ol>

          {/* Services applied */}
          {serviceGroups.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">
                Servicios aplicados
              </div>
              <div className="space-y-3">
                {serviceGroups.map((g) => (
                  <div key={g.category}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red-600 mb-1.5">
                      {g.label}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.names.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center rounded-full bg-white border border-zinc-200 text-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}

          {/* Photo with reveal */}
          {lastPhotoUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-2">
                Última actualización en taller
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lastPhotoUrl}
                alt="Avance del vehículo"
                className="w-full rounded-2xl border border-zinc-200 max-h-72 object-cover"
              />
            </motion.div>
          ) : null}

          {/* ETA card with breathing glow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 rounded-2xl bg-brand-black text-white p-5 ring-1 ring-white/5 relative overflow-hidden"
          >
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.85, 1.1, 0.85] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-10 size-40 rounded-full brand-glow blur-3xl pointer-events-none"
            />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                {isCompleted ? "Entregado" : "Tiempo estimado de entrega"}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="text-base font-black uppercase mt-1 leading-tight"
              >
                {dateLabel}
              </motion.div>
              <div className="text-xs text-zinc-400 mt-2">
                {isCompleted
                  ? "Tu vehículo está listo para retirar."
                  : "Te avisaremos por WhatsApp cuando esté listo."}
              </div>

              {/* Completed: floating sparkles */}
              {isCompleted ? (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={i}
                      className="absolute text-brand-red-500"
                      style={{
                        left: `${10 + i * 18}%`,
                        bottom: "10%",
                        fontSize: 14,
                      }}
                      animate={{
                        y: [-2, -28, -2],
                        opacity: [0, 1, 0],
                        scale: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeInOut",
                      }}
                    >
                      ✦
                    </motion.span>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.5 }}
          className="px-7 py-4 bg-zinc-50 border-t border-zinc-100 text-center"
        >
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
            3M Pro 100 · Instalador autorizado
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Link único · no compartas · caduca al completar el servicio
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

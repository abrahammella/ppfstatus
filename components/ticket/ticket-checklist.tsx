"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stepsForTicket, type Role, type StepKey, ROLE_LABELS } from "@/lib/flow/ppf-stages";
import type { EnrichedTicket } from "@/lib/queries";
import { PhotoDropzone } from "@/components/ui/photo-dropzone";
import clsx from "clsx";

export interface CompleteResult {
  ok: boolean;
  error?: string;
}

export function TicketChecklist({
  ticket,
  role,
  actorId,
  completeAction,
}: {
  ticket: EnrichedTicket;
  role: Role;
  actorId: string;
  completeAction: (formData: FormData) => Promise<CompleteResult>;
}) {
  const steps = stepsForTicket(ticket.isOfferVehicle);
  const stepState = new Map(ticket.steps.map((s) => [s.key, s]));

  return (
    <ol className="space-y-2">
      {steps.map((def, idx) => {
        const s = stepState.get(def.key);
        const isMine = role === "admin" || def.roleResponsible === role;
        return (
          <li key={def.key}>
            <StepRow
              ticketId={ticket.id}
              actorId={actorId}
              index={idx}
              defKey={def.key}
              label={def.label}
              role={def.roleResponsible}
              completed={s?.completed ?? false}
              completedAtIso={s?.completedAt}
              completedByName={
                s?.completedBy
                  ? s.completedBy === ticket.tecnico?.id
                    ? ticket.tecnico?.name
                    : s.completedBy === ticket.especialista?.id
                      ? ticket.especialista?.name
                      : s.completedBy === ticket.qc?.id
                        ? ticket.qc?.name
                        : "Admin"
                  : undefined
              }
              photoUrl={s?.photoUrl}
              allowsPhoto={Boolean(def.allowsPhoto)}
              canEdit={isMine && !s?.completed}
              completeAction={completeAction}
            />
          </li>
        );
      })}
    </ol>
  );
}

function StepRow({
  ticketId,
  actorId,
  index,
  defKey,
  label,
  role,
  completed,
  completedAtIso,
  completedByName,
  photoUrl,
  allowsPhoto,
  canEdit,
  completeAction,
}: {
  ticketId: string;
  actorId: string;
  index: number;
  defKey: StepKey;
  label: string;
  role: Role;
  completed: boolean;
  completedAtIso?: string;
  completedByName?: string;
  photoUrl?: string;
  allowsPhoto: boolean;
  canEdit: boolean;
  completeAction: (formData: FormData) => Promise<CompleteResult>;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("ticketId", ticketId);
    formData.set("stepKey", defKey);
    formData.set("actorId", actorId);
    startTransition(async () => {
      const res = await completeAction(formData);
      if (!res.ok) setError(res.error ?? "No se pudo completar el paso.");
      else setOpen(false);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={clsx(
        "rounded-2xl border p-4 transition",
        completed ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-zinc-200",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            "size-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition",
            completed
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-zinc-400 border-zinc-300",
          )}
          aria-label={completed ? "Paso completado" : "Paso pendiente"}
        >
          {completed ? "✓" : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900">{label}</div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Responsable: {ROLE_LABELS[role]}
            {completed && completedAtIso ? (
              <>
                {" · "}
                {completedByName ?? "—"}
                {" · "}
                {new Date(completedAtIso).toLocaleString("es-DO")}
              </>
            ) : null}
          </div>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Evidencia"
              className="mt-3 rounded-xl border border-zinc-200 max-h-48"
            />
          ) : null}
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "rounded-xl text-xs font-bold uppercase tracking-wide px-3 py-1.5 transition",
              open
                ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                : "bg-brand-red-600 text-white hover:bg-brand-red-700 shadow-[0_8px_20px_-8px_oklch(0.56_0.23_25/0.55)]",
            )}
          >
            {open ? "Cancelar" : "Completar"}
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {canEdit && open ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            action={onSubmit}
            className="overflow-hidden mt-3 ml-11"
            encType="multipart/form-data"
          >
            <div className="flex flex-col gap-3 pt-1">
              {allowsPhoto ? (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                    Foto de evidencia (opcional)
                  </div>
                  <PhotoDropzone name="photo" />
                </div>
              ) : null}
              <textarea
                name="notes"
                placeholder="Notas (opcional)"
                rows={2}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red-100 focus:border-brand-red-500"
              />
              {error ? (
                <div className="text-xs text-brand-red-700 bg-brand-red-50 border border-brand-red-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide px-4 py-2 hover:bg-emerald-700 transition disabled:opacity-50 shadow-[0_8px_20px_-8px_rgba(5,150,105,0.5)]"
                >
                  {pending ? "Guardando…" : "Marcar completado"}
                </button>
              </div>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

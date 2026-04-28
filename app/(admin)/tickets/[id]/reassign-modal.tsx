"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { GhostButton, PrimaryButton, FormSelect } from "@/components/ui/form-fields";
import { reassignTicketAction } from "./reassign-actions";

export interface UserOpt {
  id: string;
  name: string;
}

export function ReassignButton({
  ticketId,
  current,
  tecnicos,
  especialistas,
  qcs,
}: {
  ticketId: string;
  current: {
    assignedTecnicoId?: string;
    assignedEspecialistaId?: string;
    assignedQcId?: string;
  };
  tecnicos: UserOpt[];
  especialistas: UserOpt[];
  qcs: UserOpt[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("ticketId", ticketId);
    startTransition(async () => {
      const res = await reassignTicketAction(formData);
      if (!res.ok) {
        setError(res.error ?? "No se pudo reasignar.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700 inline-flex items-center gap-1 mt-2"
      >
        Reasignar →
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reasignar ticket"
        description="Cambia el técnico, especialista o QC asignado a este ticket."
      >
        <form action={handleSubmit} className="space-y-4">
          <FormSelect
            label="Técnico lavador"
            name="assignedTecnicoId"
            defaultValue={current.assignedTecnicoId ?? ""}
            options={[
              { value: "", label: "Sin asignar" },
              ...tecnicos.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <FormSelect
            label="Especialista"
            name="assignedEspecialistaId"
            defaultValue={current.assignedEspecialistaId ?? ""}
            options={[
              { value: "", label: "Sin asignar" },
              ...especialistas.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <FormSelect
            label="Control de calidad"
            name="assignedQcId"
            defaultValue={current.assignedQcId ?? ""}
            options={[
              { value: "", label: "Sin asignar" },
              ...qcs.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />

          {error ? (
            <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <GhostButton onClick={() => setOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar cambios"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

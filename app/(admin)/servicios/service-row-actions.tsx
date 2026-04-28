"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  FormField,
  FormSelect,
  FormTextarea,
  PrimaryButton,
  GhostButton,
} from "@/components/ui/form-fields";
import {
  ServiceFormModal,
  type ClientOpt,
  type VehicleOpt,
} from "./service-form-modal";
import {
  deleteServiceAction,
  updateServiceFullAction,
  type ActionResult,
} from "./actions";

interface ServiceRowData {
  id: string;
  clientId: string;
  type?: "PPF" | "CeramicCoating" | "Both";
  completedAt?: string;
  notes?: string;
}

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ServiceRowActions({ service }: { service: ServiceRowData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editState, editAction, editPending] = useActionState<ActionResult, FormData>(
    updateServiceFullAction,
    { ok: true },
  );

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteServiceAction(service.id);
      if (!res.ok) {
        setError(res.error ?? "No se pudo eliminar.");
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="text-[11px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1 text-brand-red-700 hover:bg-brand-red-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="text-[11px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-brand-red-700"
        >
          Eliminar
        </button>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar servicio"
        description="Modifica el tipo, fecha o notas del servicio."
      >
        <form
          action={async (fd) => {
            fd.set("id", service.id);
            await editAction(fd);
            setTimeout(() => {
              setEditOpen(false);
              router.refresh();
            }, 0);
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <FormSelect
              label="Tipo"
              name="type"
              defaultValue={service.type ?? "PPF"}
              options={[
                { value: "PPF", label: "PPF" },
                { value: "CeramicCoating", label: "Ceramic Coating" },
                { value: "Both", label: "PPF + Ceramic Coating" },
              ]}
            />
            <FormField
              label="Fecha completado"
              name="completedAt"
              type="datetime-local"
              required
              defaultValue={toLocalInput(service.completedAt)}
              error={editState.fieldErrors?.completedAt}
            />
          </div>
          <FormTextarea
            label="Notas"
            name="notes"
            rows={3}
            defaultValue={service.notes}
            error={editState.fieldErrors?.notes}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <GhostButton onClick={() => setEditOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={editPending}>
              {editPending ? "Guardando…" : "Guardar cambios"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar servicio"
        description="Esta acción no se puede deshacer."
        width="sm"
      >
        {error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100 mb-3">
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <GhostButton onClick={() => setConfirmOpen(false)}>Cancelar</GhostButton>
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            className="rounded-xl bg-brand-red-600 text-white text-sm font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-brand-red-700 transition disabled:opacity-60"
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export function NewServiceButton({
  clients,
  vehicles,
}: {
  clients: ClientOpt[];
  vehicles: VehicleOpt[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>+ Nuevo servicio</PrimaryButton>
      <ServiceFormModal
        open={open}
        onClose={() => setOpen(false)}
        clients={clients}
        vehicles={vehicles}
      />
    </>
  );
}

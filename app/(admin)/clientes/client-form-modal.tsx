"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  FormField,
  FormTextarea,
  PrimaryButton,
  GhostButton,
} from "@/components/ui/form-fields";
import {
  createClientAction,
  updateClientAction,
  type ActionResult,
} from "./actions";

interface ClientData {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export function ClientFormModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial: ClientData | null;
}) {
  const editing = initial !== null;
  const action = editing ? updateClientAction : createClientAction;
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, { ok: true });
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar cliente" : "Nuevo cliente"}
      description={editing ? "Actualiza los datos del cliente." : "Agrega un cliente a la base."}
    >
      <form
        action={async (fd) => {
          if (editing && initial) fd.set("id", initial.id);
          await formAction(fd);
          setTimeout(() => router.refresh(), 0);
        }}
        className="space-y-4"
      >
        <FormField
          label="Nombre completo"
          name="fullName"
          required
          defaultValue={initial?.fullName}
          error={state.fieldErrors?.fullName}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField
            label="Teléfono"
            name="phone"
            required
            placeholder="+1809..."
            defaultValue={initial?.phone}
            error={state.fieldErrors?.phone}
          />
          <FormField
            label="Email (opcional)"
            name="email"
            type="email"
            defaultValue={initial?.email}
            error={state.fieldErrors?.email}
          />
        </div>
        <FormTextarea
          label="Notas internas (opcional)"
          name="notes"
          rows={2}
          defaultValue={initial?.notes}
        />

        {state.error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Guardando…" : editing ? "Guardar" : "Crear cliente"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

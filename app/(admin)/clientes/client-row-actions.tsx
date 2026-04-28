"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { GhostButton, PrimaryButton } from "@/components/ui/form-fields";
import { ClientFormModal } from "./client-form-modal";
import { deleteClientAction } from "./actions";
import type { ClientTier } from "@/lib/schemas";

interface ClientRowData {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  tier?: ClientTier;
}

export function ClientRowActions({ client }: { client: ClientRowData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteClientAction(client.id);
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

      <ClientFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={client} />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar cliente"
        description={`¿Seguro? Cliente: ${client.fullName}.`}
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

export function NewClientButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>+ Nuevo cliente</PrimaryButton>
      <ClientFormModal open={open} onClose={() => setOpen(false)} initial={null} />
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { GhostButton, PrimaryButton } from "@/components/ui/form-fields";
import { ClientFormModal } from "./client-form-modal";
import { VehicleFormModal, type VehicleData } from "./vehicle-form-modal";
import { deleteClientAction, deleteVehicleAction } from "./actions";

import type { ClientTier } from "@/lib/schemas";

interface ClientData {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  tier?: ClientTier;
}

export function ClientDetailHeaderActions({ client }: { client: ClientData }) {
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
      // Server action redirects to /clientes on success.
      router.push("/clientes");
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wide px-4 py-2 hover:bg-zinc-200 transition"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-xl bg-white text-brand-red-700 text-xs font-bold uppercase tracking-wide px-4 py-2 ring-1 ring-brand-red-200 hover:bg-brand-red-50 transition"
        >
          Eliminar
        </button>
      </div>

      <ClientFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={client} />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar cliente"
        description={`Cliente: ${client.fullName}. Esta acción no se puede deshacer.`}
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

export function VehicleListActions({
  clientId,
  vehicles,
}: {
  clientId: string;
  vehicles: VehicleData[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VehicleData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteVehicleAction(deleteTarget.id, clientId);
      if (!res.ok) {
        setError(res.error ?? "No se pudo eliminar.");
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Vehículos</h2>
        <PrimaryButton onClick={() => setCreateOpen(true)} className="!text-xs !px-3 !py-1.5">
          + Vehículo
        </PrimaryButton>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-sm text-zinc-500">Aún no tiene vehículos registrados.</div>
      ) : (
        <ul className="space-y-2">
          {vehicles.map((v) => (
            <li key={v.id} className="rounded-2xl border border-zinc-200 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-zinc-900 truncate">
                  {v.brand} {v.model} {v.year}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {v.color} · placa <span className="font-mono">{v.plate}</span>
                  {v.vin ? <> · VIN {v.vin}</> : null}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditTarget(v)}
                  className="text-[11px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1 text-brand-red-700 hover:bg-brand-red-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(v)}
                  className="text-[11px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-brand-red-700"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <VehicleFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clientId={clientId}
        initial={null}
      />
      <VehicleFormModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        clientId={clientId}
        initial={editTarget}
      />
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar vehículo"
        description={
          deleteTarget
            ? `${deleteTarget.brand} ${deleteTarget.model} ${deleteTarget.year} · placa ${deleteTarget.plate}`
            : ""
        }
        width="sm"
      >
        {error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100 mb-3">
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <GhostButton onClick={() => setDeleteTarget(null)}>Cancelar</GhostButton>
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

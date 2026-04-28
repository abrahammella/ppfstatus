"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  FormField,
  FormSelect,
  FormTextarea,
  PrimaryButton,
  GhostButton,
} from "@/components/ui/form-fields";
import { createServiceAction, type ActionResult } from "./actions";

export interface ClientOpt {
  id: string;
  label: string;
}
export interface VehicleOpt {
  id: string;
  clientId: string;
  label: string;
}

const TYPES = [
  { value: "PPF", label: "PPF" },
  { value: "CeramicCoating", label: "Ceramic Coating" },
  { value: "Both", label: "PPF + Ceramic Coating" },
];

export function ServiceFormModal({
  open,
  onClose,
  clients,
  vehicles,
}: {
  open: boolean;
  onClose: () => void;
  clients: ClientOpt[];
  vehicles: VehicleOpt[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createServiceAction,
    { ok: true },
  );
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.clientId === clientId),
    [vehicles, clientId],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo servicio"
      description="Registro manual (útil para servicios pre-plataforma o notas legacy)."
    >
      <form
        action={async (fd) => {
          fd.set("clientId", clientId);
          await formAction(fd);
          setTimeout(() => router.refresh(), 0);
        }}
        className="space-y-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-700">Cliente</span>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <FormSelect
          label="Vehículo"
          name="vehicleId"
          options={
            filteredVehicles.length > 0
              ? filteredVehicles.map((v) => ({ value: v.id, label: v.label }))
              : [{ value: "", label: "Este cliente no tiene vehículos" }]
          }
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <FormSelect label="Tipo" name="type" options={TYPES} defaultValue="PPF" />
          <FormField
            label="Fecha completado"
            name="completedAt"
            type="datetime-local"
            required
            error={state.fieldErrors?.completedAt}
          />
        </div>

        <FormTextarea label="Notas (opcional)" name="notes" rows={2} />

        {state.error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Crear servicio"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

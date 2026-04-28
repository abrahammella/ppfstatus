"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  FormField,
  PrimaryButton,
  GhostButton,
} from "@/components/ui/form-fields";
import {
  createVehicleAction,
  updateVehicleAction,
  type ActionResult,
} from "./actions";

export interface VehicleData {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  vin?: string;
}

export function VehicleFormModal({
  open,
  onClose,
  clientId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  initial: VehicleData | null;
}) {
  const editing = initial !== null;
  const action = editing ? updateVehicleAction : createVehicleAction;
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, { ok: true });
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar vehículo" : "Nuevo vehículo"}
      description={editing ? "Actualiza los datos." : "Agrega un vehículo al cliente."}
    >
      <form
        action={async (fd) => {
          fd.set("clientId", clientId);
          if (editing && initial) fd.set("id", initial.id);
          await formAction(fd);
          setTimeout(() => router.refresh(), 0);
        }}
        className="space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Marca" name="brand" required defaultValue={initial?.brand} error={state.fieldErrors?.brand} />
          <FormField label="Modelo" name="model" required defaultValue={initial?.model} error={state.fieldErrors?.model} />
          <FormField label="Año" name="year" type="number" required defaultValue={initial?.year} error={state.fieldErrors?.year} />
          <FormField label="Placa" name="plate" required defaultValue={initial?.plate} error={state.fieldErrors?.plate} />
          <FormField label="Color" name="color" required defaultValue={initial?.color} error={state.fieldErrors?.color} />
          <FormField label="VIN (opcional)" name="vin" defaultValue={initial?.vin} />
        </div>

        {state.error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Guardando…" : editing ? "Guardar" : "Agregar vehículo"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

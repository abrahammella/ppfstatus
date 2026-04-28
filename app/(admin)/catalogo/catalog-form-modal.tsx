"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  FormField,
  FormSelect,
  FormTextarea,
  PrimaryButton,
  GhostButton,
} from "@/components/ui/form-fields";
import { CATEGORY_LABELS, CATEGORY_ORDER, type CatalogItem } from "@/lib/schemas";
import {
  createCatalogItemAction,
  updateCatalogItemAction,
  type CatalogState,
} from "./actions";

const initial: CatalogState = {};

export function CatalogFormModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item?: CatalogItem;
}) {
  const isEdit = Boolean(item);
  const action = isEdit ? updateCatalogItemAction : createCatalogItemAction;
  const [state, formAction, pending] = useActionState<CatalogState, FormData>(action, initial);
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar item del catálogo" : "Nuevo item del catálogo"}
      description="Define un servicio que el equipo puede aplicar a los vehículos."
    >
      <form
        action={async (fd) => {
          await formAction(fd);
          setTimeout(() => router.refresh(), 0);
          if (!state.error) onClose();
        }}
        className="space-y-4"
      >
        {item ? <input type="hidden" name="id" value={item.id} /> : null}

        <FormField
          label="Nombre"
          name="name"
          required
          defaultValue={item?.name}
          error={state.fieldErrors?.name}
          placeholder="Ej. Skygloss, Cerámica de Aro, Lavado Detallado"
        />

        <FormSelect
          label="Categoría"
          name="category"
          defaultValue={item?.category ?? "paquete_ppf"}
          options={CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          error={state.fieldErrors?.category}
        />

        <FormField
          label="Precio USD (opcional)"
          name="priceUsd"
          type="number"
          defaultValue={item?.priceUsd}
          placeholder="Ej. 900"
        />

        <FormTextarea label="Notas (opcional)" name="notes" rows={2} defaultValue={item?.notes} />

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={item?.active ?? true}
            className="size-4 accent-brand-red-600"
          />
          <span className="font-semibold">Activo</span>
          <span className="text-zinc-500 text-xs">(visible al crear tickets)</span>
        </label>

        {state.error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear item"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

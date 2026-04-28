"use client";

import { useState } from "react";
import { GhostButton, PrimaryButton } from "@/components/ui/form-fields";
import type { CatalogItem } from "@/lib/schemas";
import { CatalogFormModal } from "./catalog-form-modal";
import { deleteCatalogItemAction, toggleCatalogItemAction } from "./actions";

export function NewCatalogItemButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>+ Nuevo item</PrimaryButton>
      <CatalogFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function CatalogRowActions({ item }: { item: CatalogItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold uppercase tracking-wide text-brand-red-700 hover:text-brand-red-900"
      >
        Editar
      </button>
      <form action={toggleCatalogItemAction}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="text-xs font-bold uppercase tracking-wide text-zinc-500 hover:text-zinc-900"
        >
          {item.active ? "Desactivar" : "Activar"}
        </button>
      </form>
      <form
        action={deleteCatalogItemAction}
        onSubmit={(e) => {
          if (!confirm(`¿Eliminar "${item.name}"? Si está en uso, se desactivará en su lugar.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-brand-red-700"
        >
          Eliminar
        </button>
      </form>
      <CatalogFormModal open={open} onClose={() => setOpen(false)} item={item} />
    </div>
  );
}

// Re-export for the page header
export { GhostButton };

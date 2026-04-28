"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { GhostButton, PrimaryButton } from "@/components/ui/form-fields";
import { EmployeeFormModal } from "./employee-form-modal";
import {
  deleteEmployeeAction,
  toggleEmployeeActiveAction,
} from "./actions";
import type { Role } from "@/lib/flow/ppf-stages";

interface RowData {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export function EmployeeRowActions({
  employee,
  isCurrentUser,
}: {
  employee: RowData;
  isCurrentUser: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteEmployeeAction(employee.id);
      if (!res.ok) {
        setError(res.error ?? "No se pudo eliminar.");
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      const res = await toggleEmployeeActiveAction(employee.id);
      if (!res.ok) setError(res.error ?? "No se pudo cambiar estado.");
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={pending || isCurrentUser}
          title={isCurrentUser ? "No puedes desactivarte a ti mismo" : "Activar/desactivar"}
          className="text-[11px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {employee.active ? "Desactivar" : "Activar"}
        </button>
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
          disabled={isCurrentUser}
          title={isCurrentUser ? "No puedes eliminarte" : "Eliminar"}
          className="text-[11px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-brand-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Eliminar
        </button>
      </div>

      <EmployeeFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={employee} />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar empleado"
        description={`¿Seguro? Esta acción no se puede deshacer. Empleado: ${employee.name}.`}
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

export function NewEmployeeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>+ Nuevo empleado</PrimaryButton>
      <EmployeeFormModal open={open} onClose={() => setOpen(false)} initial={null} />
    </>
  );
}

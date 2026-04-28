"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import {
  FormField,
  FormSelect,
  PrimaryButton,
  GhostButton,
} from "@/components/ui/form-fields";
import {
  createEmployeeAction,
  updateEmployeeAction,
  type ActionResult,
} from "./actions";
import { ROLE_LABELS, ROLES, type Role } from "@/lib/flow/ppf-stages";

const ROLE_OPTIONS = ROLES.map((r: Role) => ({ value: r, label: ROLE_LABELS[r] }));

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export function EmployeeFormModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial: EmployeeData | null; // null = create mode
}) {
  const editing = initial !== null;
  const action = editing ? updateEmployeeAction : createEmployeeAction;
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, { ok: true });
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar empleado" : "Nuevo empleado"}
      description={
        editing
          ? "Actualiza datos o rol. Deja la contraseña vacía para mantener la actual."
          : "Crea un acceso para un empleado del taller."
      }
    >
      <form
        action={async (fd) => {
          if (editing && initial) fd.set("id", initial.id);
          await formAction(fd);
          // The action revalidates /empleados; now close + refresh on success.
          // We can't read state synchronously here, so close optimistically and let toast/error in next render handle bad cases.
          setTimeout(() => {
            // Defer to allow state update.
            router.refresh();
          }, 0);
        }}
        className="space-y-4"
      >
        <FormField
          label="Nombre completo"
          name="name"
          required
          defaultValue={initial?.name}
          error={state.fieldErrors?.name}
        />
        <FormField
          label="Correo"
          name="email"
          type="email"
          required
          defaultValue={initial?.email}
          error={state.fieldErrors?.email}
        />
        <FormSelect
          label="Rol"
          name="role"
          defaultValue={initial?.role ?? "tecnico"}
          options={ROLE_OPTIONS}
          error={state.fieldErrors?.role}
        />
        <FormField
          label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
          name="password"
          type="password"
          required={!editing}
          helper={editing ? "Mínimo 8 caracteres si la cambias." : "Mínimo 8 caracteres."}
          error={state.fieldErrors?.password}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
            className="size-4 accent-brand-red-600"
          />
          Activo (puede iniciar sesión)
        </label>

        {state.error ? (
          <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Guardando…" : editing ? "Guardar" : "Crear empleado"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

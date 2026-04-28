"use client";

import { useActionState, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FormField,
  FormSelect,
  PrimaryButton,
} from "@/components/ui/form-fields";
import { createTicketAction, type NewTicketState } from "./actions";
import type { Client } from "@/lib/schemas";
import clsx from "clsx";

interface VehicleOpt {
  id: string;
  clientId: string;
  label: string;
}
interface UserOpt {
  id: string;
  name: string;
}

const initial: NewTicketState = {};

export function NewTicketForm({
  clients,
  vehicles,
  tecnicos,
  especialistas,
  qcs,
}: {
  clients: Client[];
  vehicles: VehicleOpt[];
  tecnicos: UserOpt[];
  especialistas: UserOpt[];
  qcs: UserOpt[];
}) {
  const [state, action, pending] = useActionState(createTicketAction, initial);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.clientId === clientId),
    [vehicles, clientId],
  );

  return (
    <form action={action} className="space-y-7">
      <Section step={1} title="Cliente">
        <Toggle
          value={clientMode}
          onChange={setClientMode}
          options={[
            { value: "existing", label: "Existente" },
            { value: "new", label: "Nuevo" },
          ]}
          name="clientMode"
        />
        <AnimatePresence mode="wait">
          {clientMode === "existing" ? (
            <motion.div
              key="existing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-700">
                  Cliente
                </span>
                <select
                  name="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid sm:grid-cols-2 gap-3"
            >
              <FormField
                label="Nombre completo"
                name="fullName"
                required
                error={state.fieldErrors?.fullName}
                className="sm:col-span-2"
              />
              <FormField
                label="Teléfono"
                name="phone"
                required
                placeholder="+1809..."
                error={state.fieldErrors?.phone}
              />
              <FormField label="Email (opcional)" name="email" type="email" />
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section step={2} title="Vehículo">
        <Toggle
          value={vehicleMode}
          onChange={setVehicleMode}
          options={[
            { value: "existing", label: "Existente" },
            { value: "new", label: "Nuevo" },
          ]}
          name="vehicleMode"
        />
        <AnimatePresence mode="wait">
          {vehicleMode === "existing" ? (
            <motion.div
              key="existing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <FormSelect
                label="Vehículo del cliente"
                name="vehicleId"
                options={
                  filteredVehicles.length > 0
                    ? filteredVehicles.map((v) => ({ value: v.id, label: v.label }))
                    : [{ value: "", label: "El cliente no tiene vehículos — registra uno nuevo" }]
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid sm:grid-cols-2 gap-3"
            >
              <FormField label="Marca" name="brand" required />
              <FormField label="Modelo" name="model" required />
              <FormField label="Año" name="year" type="number" required />
              <FormField label="Placa" name="plate" required />
              <FormField label="Color" name="color" required />
              <FormField label="VIN (opcional)" name="vin" />
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section step={3} title="Servicio">
        <div className="grid sm:grid-cols-2 gap-3">
          <FormSelect
            label="Tipo"
            name="serviceType"
            defaultValue="PPF"
            options={[
              { value: "PPF", label: "PPF" },
              { value: "CeramicCoating", label: "Ceramic Coating" },
              { value: "Both", label: "PPF + Ceramic Coating" },
            ]}
          />
          <FormField
            label="ETA de entrega"
            name="etaAt"
            type="datetime-local"
            required
            error={state.fieldErrors?.etaAt}
          />
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="isOfferVehicle"
            className="size-4 accent-brand-red-600"
          />
          <span>
            <span className="font-semibold">Vehículo de la oferta</span>{" "}
            <span className="text-zinc-500">
              (incluye paso por JS Autotuning para laminado y alfombras bandeja).
            </span>
          </span>
        </label>
      </Section>

      <Section step={4} title="Asignaciones (opcional)">
        <div className="grid sm:grid-cols-3 gap-3">
          <FormSelect
            label="Técnico lavador"
            name="assignedTecnicoId"
            options={[
              { value: "", label: "Sin asignar" },
              ...tecnicos.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <FormSelect
            label="Especialista"
            name="assignedEspecialistaId"
            options={[
              { value: "", label: "Sin asignar" },
              ...especialistas.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <FormSelect
            label="Control de calidad"
            name="assignedQcId"
            options={[
              { value: "", label: "Sin asignar" },
              ...qcs.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        </div>
      </Section>

      {state.error ? (
        <div className="rounded-xl bg-brand-red-50 text-brand-red-700 text-sm px-3 py-2 border border-brand-red-100">
          {state.error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear ticket"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="flex items-center gap-2.5">
        <span className="size-7 rounded-full bg-brand-red-600 text-white flex items-center justify-center text-xs font-black">
          {step}
        </span>
        <span className="text-sm font-black uppercase tracking-tight text-zinc-900">{title}</span>
      </legend>
      <div className="pl-9">{children}</div>
    </fieldset>
  );
}

function Toggle<T extends string>({
  value,
  onChange,
  options,
  name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  name: string;
}) {
  return (
    <div className="inline-flex rounded-xl bg-zinc-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg transition",
            value === opt.value
              ? "bg-brand-red-600 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900",
          )}
        >
          {opt.label}
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

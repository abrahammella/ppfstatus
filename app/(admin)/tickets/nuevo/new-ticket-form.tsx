"use client";

import { useActionState, useMemo, useState } from "react";
import { createTicketAction, type NewTicketState } from "./actions";
import type { Client } from "@/lib/schemas";

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
    <form action={action} className="space-y-6">
      <Section title="Cliente">
        <Tabs
          value={clientMode}
          onChange={setClientMode}
          options={[
            { value: "existing", label: "Existente" },
            { value: "new", label: "Nuevo" },
          ]}
          name="clientMode"
        />
        {clientMode === "existing" ? (
          <Select
            label="Cliente"
            name="clientId"
            value={clientId}
            onChange={setClientId}
            options={clients.map((c) => ({ value: c.id, label: c.fullName }))}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre completo" name="fullName" error={state.fieldErrors?.fullName} />
            <Field label="Teléfono" name="phone" placeholder="+1809..." error={state.fieldErrors?.phone} />
            <Field label="Email (opcional)" name="email" type="email" />
          </div>
        )}
      </Section>

      <Section title="Vehículo">
        <Tabs
          value={vehicleMode}
          onChange={setVehicleMode}
          options={[
            { value: "existing", label: "Existente" },
            { value: "new", label: "Nuevo" },
          ]}
          name="vehicleMode"
        />
        {vehicleMode === "existing" ? (
          <Select
            label="Vehículo del cliente"
            name="vehicleId"
            options={
              filteredVehicles.length > 0
                ? filteredVehicles.map((v) => ({ value: v.id, label: v.label }))
                : [{ value: "", label: "El cliente no tiene vehículos — registra uno nuevo" }]
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Marca" name="brand" />
            <Field label="Modelo" name="model" />
            <Field label="Año" name="year" type="number" />
            <Field label="Placa" name="plate" />
            <Field label="Color" name="color" />
            <Field label="VIN (opcional)" name="vin" />
          </div>
        )}
      </Section>

      <Section title="Servicio">
        <div className="grid sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de servicio"
            name="serviceType"
            options={[
              { value: "PPF", label: "PPF" },
              { value: "CeramicCoating", label: "Ceramic Coating" },
              { value: "Both", label: "PPF + Ceramic Coating" },
            ]}
          />
          <Field label="ETA de entrega" name="etaAt" type="datetime-local" required />
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-zinc-700">
          <input type="checkbox" name="isOfferVehicle" className="size-4 accent-brand-red-600" />
          Vehículo de la oferta (incluye envío a JS Autotuning para laminado y alfombras)
        </label>
      </Section>

      <Section title="Asignaciones (opcional)">
        <div className="grid sm:grid-cols-3 gap-3">
          <Select
            label="Técnico lavador"
            name="assignedTecnicoId"
            options={[{ value: "", label: "Sin asignar" }, ...tecnicos.map((u) => ({ value: u.id, label: u.name }))]}
          />
          <Select
            label="Especialista de aplicación"
            name="assignedEspecialistaId"
            options={[
              { value: "", label: "Sin asignar" },
              ...especialistas.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <Select
            label="Control de calidad"
            name="assignedQcId"
            options={[{ value: "", label: "Sin asignar" }, ...qcs.map((u) => ({ value: u.id, label: u.name }))]}
          />
        </div>
      </Section>

      {state.error ? (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">
          {state.error}
        </div>
      ) : null}

      <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-zinc-800 transition disabled:opacity-50"
        >
          {pending ? "Creando…" : "Crear ticket"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-zinc-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function Tabs<T extends string>({
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
          className={
            value === opt.value
              ? "px-4 py-1.5 text-sm font-medium rounded-lg bg-white shadow-sm text-zinc-900"
              : "px-4 py-1.5 text-sm font-medium rounded-lg text-zinc-500 hover:text-zinc-700"
          }
        >
          {opt.label}
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-700">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red-100 focus:border-brand-red-500"
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="rounded-xl border border-zinc-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-red-100 focus:border-brand-red-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

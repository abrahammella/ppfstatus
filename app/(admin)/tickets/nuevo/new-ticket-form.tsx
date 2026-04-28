"use client";

import { useActionState, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FormField,
  FormSelect,
  PrimaryButton,
} from "@/components/ui/form-fields";
import { createTicketAction, type NewTicketState } from "./actions";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type CatalogItem,
  type Client,
} from "@/lib/schemas";
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
  catalog,
  initialClientId,
}: {
  clients: Client[];
  vehicles: VehicleOpt[];
  tecnicos: UserOpt[];
  especialistas: UserOpt[];
  qcs: UserOpt[];
  catalog: CatalogItem[];
  initialClientId?: string;
}) {
  const [state, action, pending] = useActionState(createTicketAction, initial);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState<string>(initialClientId ?? clients[0]?.id ?? "");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.clientId === clientId),
    [vehicles, clientId],
  );

  const catalogByCategory = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, catalog.filter((i) => i.category === cat));
    }
    return map;
  }, [catalog]);

  // Derive serviceType from selected items: PPF if any paquete_ppf,
  // CeramicCoating if any ceramic_coating, Both if both, else PPF as fallback.
  const derivedServiceType = useMemo(() => {
    let hasPpf = false;
    let hasCc = false;
    for (const id of selectedItemIds) {
      const item = catalog.find((c) => c.id === id);
      if (!item) continue;
      if (item.category === "paquete_ppf") hasPpf = true;
      if (item.category === "ceramic_coating") hasCc = true;
    }
    if (hasPpf && hasCc) return "Both";
    if (hasCc) return "CeramicCoating";
    return "PPF";
  }, [selectedItemIds, catalog]);

  function toggleItem(id: string) {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
                key={`veh-${clientId}`}
                label="Vehículo del cliente"
                name="vehicleId"
                defaultValue={filteredVehicles[0]?.id}
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

      <Section step={3} title="Servicios">
        <input type="hidden" name="serviceType" value={derivedServiceType} />
        {[...selectedItemIds].map((id) => (
          <input key={id} type="hidden" name="catalogItemIds" value={id} />
        ))}

        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3 sm:p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-600">
              Marca todos los servicios que se aplicarán a este vehículo.
            </p>
            <span
              className={clsx(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                selectedItemIds.size > 0
                  ? "bg-brand-red-50 text-brand-red-700 border-brand-red-100"
                  : "bg-zinc-100 text-zinc-500 border-zinc-200",
              )}
            >
              {selectedItemIds.size} seleccionado{selectedItemIds.size === 1 ? "" : "s"}
            </span>
          </div>

          {CATEGORY_ORDER.map((cat) => {
            const items = catalogByCategory.get(cat) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">
                  {CATEGORY_LABELS[cat]}
                </div>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {items.map((item) => {
                    const checked = selectedItemIds.has(item.id);
                    return (
                      <label
                        key={item.id}
                        className={clsx(
                          "flex items-start gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition",
                          checked
                            ? "border-brand-red-500 bg-white ring-2 ring-brand-red-100"
                            : "border-zinc-200 bg-white hover:border-zinc-300",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item.id)}
                          className="size-4 mt-0.5 accent-brand-red-600 shrink-0"
                        />
                        <span className="flex-1 min-w-0">
                          <span className="text-sm text-zinc-900 font-medium leading-tight block">
                            {item.name}
                          </span>
                          {typeof item.priceUsd === "number" ? (
                            <span className="text-[11px] text-zinc-500 tabular-nums">
                              US${item.priceUsd}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
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

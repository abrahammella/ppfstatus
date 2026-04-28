import Link from "next/link";
import { repos } from "@/lib/repositories";
import { NewTicketForm } from "./new-ticket-form";
import { SectionCard } from "@/components/dashboard/section-card";

export const dynamic = "force-dynamic";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId: prefillClientId } = await searchParams;
  const [clients, vehicles, users, catalog] = await Promise.all([
    repos.clients.list(),
    repos.vehicles.list(),
    repos.users.list(),
    repos.catalog.list(),
  ]);

  const tecnicos = users.filter((u) => u.role === "tecnico" && u.active);
  const especialistas = users.filter((u) => u.role === "especialista" && u.active);
  const qcs = users.filter((u) => u.role === "qc" && u.active);
  const activeCatalog = catalog.filter((i) => i.active);
  const initialClientId = prefillClientId && clients.some((c) => c.id === prefillClientId)
    ? prefillClientId
    : undefined;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="-mt-2">
        <Link
          href="/tablero"
          className="text-[11px] font-bold uppercase tracking-wide text-brand-red-600 hover:text-brand-red-700"
        >
          ← Tablero
        </Link>
        <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
          <span className="h-px w-6 bg-brand-red-600" /> Orden de servicio
        </p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
          Nuevo ticket
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Crea una orden de servicio. Selecciona un cliente y vehículo existente, o registra uno
          nuevo.
        </p>
      </div>

      <SectionCard delay={0.1}>
        <NewTicketForm
          clients={clients}
          vehicles={vehicles.map((v) => ({
            id: v.id,
            clientId: v.clientId,
            label: `${v.brand} ${v.model} ${v.year} · ${v.plate}`,
          }))}
          tecnicos={tecnicos.map((u) => ({ id: u.id, name: u.name }))}
          especialistas={especialistas.map((u) => ({ id: u.id, name: u.name }))}
          qcs={qcs.map((u) => ({ id: u.id, name: u.name }))}
          catalog={activeCatalog}
          initialClientId={initialClientId}
        />
      </SectionCard>
    </div>
  );
}

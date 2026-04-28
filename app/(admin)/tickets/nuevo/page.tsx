import Link from "next/link";
import { repos } from "@/lib/repositories";
import { NewTicketForm } from "./new-ticket-form";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const [clients, vehicles, users] = await Promise.all([
    repos.clients.list(),
    repos.vehicles.list(),
    repos.users.list(),
  ]);

  const tecnicos = users.filter((u) => u.role === "tecnico" && u.active);
  const especialistas = users.filter((u) => u.role === "especialista" && u.active);
  const qcs = users.filter((u) => u.role === "qc" && u.active);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="-mt-2">
        <Link href="/dashboard" className="text-sm text-brand-red-600 hover:text-brand-red-700">
          ← Dashboard
        </Link>
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mt-2">Nuevo ticket</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Crea una orden de servicio. Puedes seleccionar un cliente y vehículo existente, o registrar
          uno nuevo.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
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
        />
      </div>
    </div>
  );
}

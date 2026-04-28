import { repos } from "@/lib/repositories";
import Link from "next/link";
import { ClientRowActions, NewClientButton } from "./client-row-actions";
import { SearchTable } from "@/components/ui/search-table";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const [clients, vehicles, services] = await Promise.all([
    repos.clients.list(),
    repos.vehicles.list(),
    repos.services.list(),
  ]);

  const stats = (id: string) => ({
    vehicles: vehicles.filter((v) => v.clientId === id).length,
    services: services.filter((s) => s.clientId === id).length,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
            <span className="h-px w-6 bg-brand-red-600" /> Base de clientes
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Clientes
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {clients.length} cliente{clients.length === 1 ? "" : "s"} registrado
            {clients.length === 1 ? "" : "s"}.
          </p>
        </div>
        <NewClientButton />
      </div>

      <SearchTable
        placeholder="Buscar por nombre, teléfono o email…"
        totalCount={clients.length}
      >
      <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[11px] font-bold uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Cliente</th>
              <th className="text-left px-5 py-3">Contacto</th>
              <th className="text-right px-5 py-3">Vehículos</th>
              <th className="text-right px-5 py-3">Servicios</th>
              <th className="text-right px-5 py-3">Última visita</th>
              <th className="text-right px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const s = stats(c.id);
              return (
                <tr
                  key={c.id}
                  data-search={`${c.fullName} ${c.phone} ${c.email ?? ""}`.toLowerCase()}
                  className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60 transition"
                >
                  <td className="px-5 py-3">
                    <Link href={`/clientes/${c.id}`} className="block group">
                      <div className="font-semibold text-zinc-900 group-hover:text-brand-red-700 transition">
                        {c.fullName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Cliente desde {new Date(c.createdAt).toLocaleDateString("es-DO")}
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    <div className="font-mono text-xs">{c.phone}</div>
                    {c.email ? (
                      <div className="text-xs text-zinc-500 font-mono">{c.email}</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-bold">{s.vehicles}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-bold">{s.services}</td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-500">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString("es-DO") : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ClientRowActions
                      client={{
                        id: c.id,
                        fullName: c.fullName,
                        phone: c.phone,
                        email: c.email,
                        notes: c.notes,
                        tier: c.tier,
                      }}
                    />
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-500">
                  Sin clientes todavía. Crea el primero con el botón de arriba.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      </SearchTable>
    </div>
  );
}

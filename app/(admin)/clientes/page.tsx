import { repos } from "@/lib/repositories";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const [clients, vehicles, services] = await Promise.all([
    repos.clients.list(),
    repos.vehicles.list(),
    repos.services.list(),
  ]);

  const byClient = (id: string) => ({
    vehicles: vehicles.filter((v) => v.clientId === id).length,
    services: services.filter((s) => s.clientId === id).length,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2">
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900">Clientes</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {clients.length} cliente{clients.length === 1 ? "" : "s"} registrado
          {clients.length === 1 ? "" : "s"} en la base.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Cliente</th>
              <th className="text-left px-5 py-3 font-medium">Contacto</th>
              <th className="text-right px-5 py-3 font-medium">Vehículos</th>
              <th className="text-right px-5 py-3 font-medium">Servicios</th>
              <th className="text-right px-5 py-3 font-medium">Última visita</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const stats = byClient(c.id);
              return (
                <tr key={c.id} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60">
                  <td className="px-5 py-3">
                    <div className="font-medium text-zinc-900">{c.fullName}</div>
                    <div className="text-xs text-zinc-500">
                      Cliente desde {new Date(c.createdAt).toLocaleDateString("es-DO")}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    <div>{c.phone}</div>
                    {c.email ? <div className="text-xs text-zinc-500">{c.email}</div> : null}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{stats.vehicles}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{stats.services}</td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-500">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString("es-DO") : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/clientes/${c.id}`} className="text-xs text-brand-red-600 hover:text-brand-red-700">
                      Ver →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { repos } from "@/lib/repositories";
import { ServiceTypeSchema } from "@/lib/schemas";
import {
  NewServiceButton,
  ServiceRowActions,
} from "./service-row-actions";
import { SearchTable } from "@/components/ui/search-table";
import { ExportServicesButton } from "./export-button";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<ReturnType<typeof ServiceTypeSchema.parse>, string> = {
  PPF: "PPF",
  CeramicCoating: "Ceramic Coating",
  Both: "PPF + Ceramic",
};

export default async function ServiciosPage() {
  const [services, clients, vehicles] = await Promise.all([
    repos.services.list(),
    repos.clients.list(),
    repos.vehicles.list(),
  ]);

  const cMap = new Map(clients.map((c) => [c.id, c]));
  const vMap = new Map(vehicles.map((v) => [v.id, v]));

  const sorted = [...services].sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));

  const clientOpts = clients
    .map((c) => ({ id: c.id, label: c.fullName }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const vehicleOpts = vehicles.map((v) => ({
    id: v.id,
    clientId: v.clientId,
    label: `${v.brand} ${v.model} ${v.year} · ${v.plate}`,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
            <span className="h-px w-6 bg-brand-red-600" /> Historial
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Servicios
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {services.length} servicio{services.length === 1 ? "" : "s"} registrado
            {services.length === 1 ? "" : "s"} (incluye históricos pre-plataforma).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportServicesButton />
          <NewServiceButton clients={clientOpts} vehicles={vehicleOpts} />
        </div>
      </div>

      <SearchTable
        placeholder="Buscar por vehículo, cliente, placa, tipo o notas…"
        totalCount={services.length}
      >
      <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[11px] font-bold uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Vehículo</th>
              <th className="text-left px-5 py-3">Cliente</th>
              <th className="text-left px-5 py-3">Tipo</th>
              <th className="text-left px-5 py-3">Fecha</th>
              <th className="text-left px-5 py-3">Notas</th>
              <th className="text-right px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const v = vMap.get(s.vehicleId);
              const c = cMap.get(s.clientId);
              return (
                <tr
                  key={s.id}
                  data-search={`${v ? `${v.brand} ${v.model} ${v.year} ${v.plate}` : ""} ${c?.fullName ?? ""} ${TYPE_LABEL[s.type]} ${s.notes ?? ""}`.toLowerCase()}
                  className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60 transition"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/servicios/${s.id}`}
                      className="font-semibold text-zinc-900 hover:text-brand-red-700"
                    >
                      {v ? `${v.brand} ${v.model} ${v.year}` : "—"}
                    </Link>
                    {v ? (
                      <div className="text-xs text-zinc-500 font-mono">{v.plate}</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-zinc-700">{c?.fullName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-zinc-700">
                      {TYPE_LABEL[s.type]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-600">
                    {new Date(s.completedAt).toLocaleString("es-DO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 max-w-xs">
                    {s.notes ? (
                      <div className="text-xs text-zinc-600 truncate" title={s.notes}>
                        {s.notes}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/servicios/${s.id}`}
                        className="text-xs font-bold uppercase tracking-wide text-brand-red-700 hover:text-brand-red-900"
                      >
                        Ver detalle
                      </Link>
                      <ServiceRowActions
                        service={{
                          id: s.id,
                          clientId: s.clientId,
                          type: s.type,
                          completedAt: s.completedAt,
                          notes: s.notes,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-500">
                  Sin servicios todavía. Los tickets completados los crean automáticamente; también
                  puedes registrar uno manual.
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

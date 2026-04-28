import { notFound } from "next/navigation";
import Link from "next/link";
import { repos } from "@/lib/repositories";
import { ServiceTypeSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<ReturnType<typeof ServiceTypeSchema.parse>, string> = {
  PPF: "PPF",
  CeramicCoating: "Ceramic Coating",
  Both: "PPF + Ceramic Coating",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, vehicles, services] = await Promise.all([
    repos.clients.findById(id),
    repos.vehicles.listByClient(id),
    repos.services.listByClient(id),
  ]);
  if (!client) notFound();
  const sortedServices = [...services].sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="-mt-2">
        <Link href="/clientes" className="text-sm text-brand-red-600 hover:text-brand-red-700">
          ← Clientes
        </Link>
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mt-2">{client.fullName}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {client.phone}
          {client.email ? ` · ${client.email}` : ""}
          {" · "}cliente desde {new Date(client.createdAt).toLocaleDateString("es-DO")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Vehículos</h2>
          {vehicles.length === 0 ? (
            <div className="text-sm text-zinc-500">Aún no tiene vehículos registrados.</div>
          ) : (
            <ul className="space-y-2">
              {vehicles.map((v) => (
                <li key={v.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="font-medium text-zinc-900">
                    {v.brand} {v.model} {v.year}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {v.color} · placa <span className="font-mono">{v.plate}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Historial de servicios</h2>
          {sortedServices.length === 0 ? (
            <div className="text-sm text-zinc-500">Sin servicios registrados todavía.</div>
          ) : (
            <ol className="relative ml-2 space-y-4 border-l border-zinc-200 pl-4">
              {sortedServices.map((s) => (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[21px] top-1 size-3 rounded-full bg-brand-red-500 ring-2 ring-white" />
                  <div className="text-sm font-medium text-zinc-900">{TYPE_LABEL[s.type]}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {new Date(s.completedAt).toLocaleString("es-DO")}
                  </div>
                  {s.notes ? <div className="text-xs text-zinc-600 mt-1">{s.notes}</div> : null}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

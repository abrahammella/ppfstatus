import { repos } from "@/lib/repositories";
import { CATEGORY_LABELS, CATEGORY_ORDER, type CatalogCategory } from "@/lib/schemas";
import { CatalogRowActions, NewCatalogItemButton } from "./catalog-row-actions";

export const dynamic = "force-dynamic";

const CATEGORY_TINTS: Record<CatalogCategory, string> = {
  paquete_ppf: "bg-brand-red-50 text-brand-red-700 border-brand-red-100",
  ceramic_coating: "bg-zinc-900 text-white border-zinc-900",
  lavado: "bg-brand-yellow-300 text-zinc-900 border-brand-yellow-400",
  otro: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export default async function CatalogoPage() {
  const items = await repos.catalog.list();
  const grouped = new Map(CATEGORY_ORDER.map((c) => [c, items.filter((i) => i.category === c)]));
  const total = items.length;
  const activeCount = items.filter((i) => i.active).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
            <span className="h-px w-6 bg-brand-red-600" /> Catálogo
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Servicios del taller
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {activeCount} activo{activeCount === 1 ? "" : "s"} de {total} totales · agrupados por
            categoría.
          </p>
        </div>
        <NewCatalogItemButton />
      </div>

      <div className="space-y-6">
        {CATEGORY_ORDER.map((cat) => {
          const rows = grouped.get(cat) ?? [];
          return (
            <section
              key={cat}
              className="rounded-3xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden"
            >
              <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${CATEGORY_TINTS[cat]}`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {rows.length} item{rows.length === 1 ? "" : "s"}
                  </span>
                </div>
              </header>
              {rows.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-zinc-400">
                  Sin items en esta categoría todavía.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 text-[11px] font-bold uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-2.5">Nombre</th>
                      <th className="text-left px-5 py-2.5">Precio</th>
                      <th className="text-left px-5 py-2.5">Estado</th>
                      <th className="text-right px-5 py-2.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60 transition"
                      >
                        <td className="px-5 py-3">
                          <div className="font-semibold text-zinc-900">{item.name}</div>
                          {item.notes ? (
                            <div className="text-[11px] text-zinc-500 mt-0.5">{item.notes}</div>
                          ) : null}
                        </td>
                        <td className="px-5 py-3 text-zinc-700 tabular-nums">
                          {typeof item.priceUsd === "number" ? `US$${item.priceUsd}` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          {item.active ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <CatalogRowActions item={item} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

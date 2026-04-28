import { repos } from "@/lib/repositories";
import { ROLE_LABELS } from "@/lib/flow/ppf-stages";
import { requireRole } from "@/lib/auth/session";
import {
  EmployeeRowActions,
  NewEmployeeButton,
} from "./employee-row-actions";
import { SearchTable } from "@/components/ui/search-table";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const session = await requireRole("admin");
  const users = await repos.users.list();
  const sorted = [...users].sort((a, b) =>
    a.role === b.role ? a.name.localeCompare(b.name) : a.role.localeCompare(b.role),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-4 -mt-2">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-brand-red-600">
            <span className="h-px w-6 bg-brand-red-600" /> Equipo
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Empleados
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {users.length} usuario{users.length === 1 ? "" : "s"} con acceso a la plataforma.
          </p>
        </div>
        <NewEmployeeButton />
      </div>

      <SearchTable
        placeholder="Buscar por nombre, email o rol…"
        totalCount={users.length}
      >
      <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[11px] font-bold uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Empleado</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="text-right px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr
                key={u.id}
                data-search={`${u.name} ${u.email} ${ROLE_LABELS[u.role]}`.toLowerCase()}
                className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60 transition"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-white text-xs font-black flex items-center justify-center ring-1 ring-white">
                      {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <div className="font-semibold text-zinc-900">
                        {u.name}
                        {u.id === session.sub ? (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-brand-red-700 bg-brand-red-50 border border-brand-red-100 rounded-full px-1.5 py-0.5">
                            tú
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Activo desde {new Date(u.createdAt).toLocaleDateString("es-DO")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-zinc-700">{ROLE_LABELS[u.role]}</td>
                <td className="px-5 py-3 text-zinc-700 font-mono text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  {u.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide border border-emerald-200">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide border border-zinc-200">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <EmployeeRowActions
                    employee={{ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active }}
                    isCurrentUser={u.id === session.sub}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </SearchTable>
    </div>
  );
}

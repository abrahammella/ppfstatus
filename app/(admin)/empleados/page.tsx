import { repos } from "@/lib/repositories";
import { ROLE_LABELS } from "@/lib/flow/ppf-stages";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const users = await repos.users.list();
  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2">
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900">Empleados</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {users.length} usuario{users.length === 1 ? "" : "s"} con acceso a la plataforma.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Empleado</th>
              <th className="text-left px-5 py-3 font-medium">Rol</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-right px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-white text-xs font-semibold flex items-center justify-center">
                      {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <div className="font-medium text-zinc-900">{u.name}</div>
                      <div className="text-xs text-zinc-500">
                        Activo desde {new Date(u.createdAt).toLocaleDateString("es-DO")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-zinc-700">{ROLE_LABELS[u.role]}</td>
                <td className="px-5 py-3 text-zinc-700">{u.email}</td>
                <td className="px-5 py-3 text-right">
                  {u.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-medium border border-emerald-200">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-600 px-2.5 py-0.5 text-xs font-medium border border-zinc-200">
                      Inactivo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Sidebar } from "./sidebar";
import type { Role } from "@/lib/flow/ppf-stages";

export function AppShell({
  role,
  name,
  title,
  subtitle,
  actions,
  children,
}: {
  role: Role;
  name: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh md:h-screen md:overflow-hidden flex-col md:flex-row">
      <Sidebar role={role} name={name} />
      <main className="flex-1 md:overflow-y-auto">
        <header className="px-4 sm:px-6 lg:px-10 pt-6 md:pt-8 pb-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              {title ? (
                <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900">{title}</h1>
              ) : null}
              {subtitle ? (
                <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </header>
        <div className="px-4 sm:px-6 lg:px-10 pb-12">{children}</div>
      </main>
    </div>
  );
}

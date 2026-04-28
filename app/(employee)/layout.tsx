import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("tecnico", "especialista", "qc");
  return (
    <AppShell role={session.role} name={session.name}>
      {children}
    </AppShell>
  );
}

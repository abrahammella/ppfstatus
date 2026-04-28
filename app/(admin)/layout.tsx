import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  return (
    <AppShellWrapper name={session.name}>{children}</AppShellWrapper>
  );
}

function AppShellWrapper({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <AppShell role="admin" name={name}>
      {children}
    </AppShell>
  );
}

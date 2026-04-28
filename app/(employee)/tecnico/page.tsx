import { requireRole } from "@/lib/auth/session";
import { MyTicketsPage, tecnicoConfig } from "../_my-tickets-page";

export const dynamic = "force-dynamic";

export default async function TecnicoPage() {
  const s = await requireRole("tecnico", "admin");
  return <MyTicketsPage userId={s.sub} config={tecnicoConfig} />;
}

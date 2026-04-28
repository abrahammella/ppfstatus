import { requireRole } from "@/lib/auth/session";
import { MyTicketsPage, especialistaConfig } from "../_my-tickets-page";

export const dynamic = "force-dynamic";

export default async function EspecialistaPage() {
  const s = await requireRole("especialista", "admin");
  return <MyTicketsPage userId={s.sub} config={especialistaConfig} />;
}

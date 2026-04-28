import { requireRole } from "@/lib/auth/session";
import { MyTicketsPage, qcConfig } from "../_my-tickets-page";

export const dynamic = "force-dynamic";

export default async function QcPage() {
  const s = await requireRole("qc", "admin");
  return <MyTicketsPage userId={s.sub} config={qcConfig} />;
}

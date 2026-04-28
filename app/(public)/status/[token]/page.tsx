import { notFound } from "next/navigation";
import { repos } from "@/lib/repositories";
import { verifyPublicToken } from "@/lib/crypto/public-token";
import { progressPercent } from "@/lib/flow/ppf-stages";
import { AnimatedStatus } from "@/components/public/animated-status";

export const dynamic = "force-dynamic";

function maskPlate(plate: string): string {
  if (plate.length <= 3) return plate;
  return plate.slice(0, 1) + "•".repeat(plate.length - 3) + plate.slice(-2);
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decoded = verifyPublicToken(token);
  if (!decoded) notFound();

  const ticket = await repos.tickets.findByPublicToken(token);
  if (!ticket || ticket.id !== decoded.ticketId) notFound();

  const [client, vehicle] = await Promise.all([
    repos.clients.findById(ticket.clientId),
    repos.vehicles.findById(ticket.vehicleId),
  ]);

  const completed = new Set(ticket.steps.filter((s) => s.completed).map((s) => s.key));
  const percent = progressPercent(ticket.isOfferVehicle, completed);
  const lastPhoto = [...ticket.steps].reverse().find((s) => s.photoUrl)?.photoUrl ?? null;

  const vehicleLine = vehicle
    ? `${vehicle.brand} ${vehicle.model} ${vehicle.year} · ${vehicle.color} · placa ${maskPlate(vehicle.plate)}`
    : null;

  return (
    <div className="min-h-screen showroom-bg flex items-center justify-center px-4 py-10 sm:py-16">
      <AnimatedStatus
        clientName={client?.fullName ?? "—"}
        vehicleLine={vehicleLine}
        status={ticket.status}
        percent={percent}
        etaIso={ticket.etaAt}
        completedAtIso={ticket.completedAt ?? null}
        isCompleted={ticket.status === "completado"}
        lastPhotoUrl={lastPhoto}
      />
    </div>
  );
}

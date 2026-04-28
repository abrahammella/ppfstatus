import { notFound } from "next/navigation";
import Image from "next/image";
import { repos } from "@/lib/repositories";
import { verifyPublicToken } from "@/lib/crypto/public-token";
import {
  STAGES,
  STAGE_LABELS,
  STAGE_LABELS_SHORT,
  progressPercent,
  type Stage,
} from "@/lib/flow/ppf-stages";

export const dynamic = "force-dynamic";

const VISIBLE_STAGES: Stage[] = ["recepcion", "lavado", "aplicacion", "qc", "entrega"];

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
  const pct = progressPercent(ticket.isOfferVehicle, completed);
  const currentIdx = STAGES.indexOf(ticket.status);
  const lastWithPhoto = [...ticket.steps].reverse().find((s) => s.photoUrl);
  const isCompleted = ticket.status === "completado";

  return (
    <div className="min-h-screen showroom-bg flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl">
        {/* Brand header outside card */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="relative size-10 rounded-xl bg-black ring-1 ring-white/15 overflow-hidden">
            <Image src="/brand/logojs.jpg" alt="JS Detailing Center" fill sizes="40px" className="object-cover" />
          </div>
          <div>
            <div className="text-white text-sm font-black tracking-[0.2em]">JS DETAILING</div>
            <div className="text-brand-red-500 text-[9px] font-bold tracking-[0.4em] -mt-0.5">CENTER</div>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] border border-white/40 overflow-hidden">
          {/* Status banner */}
          <div className="relative bg-brand-black text-white px-7 py-5 overflow-hidden">
            <div className="absolute -top-20 -right-16 size-56 rounded-full brand-glow blur-3xl opacity-70 pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  {isCompleted ? "Trabajo completado" : "Estado actual"}
                </div>
                <div className="text-xl font-black uppercase tracking-tight mt-0.5">
                  {STAGE_LABELS[ticket.status]}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Avance
                </div>
                <div className="text-2xl font-black tabular-nums mt-0.5 text-brand-red-500">
                  {pct}%
                </div>
              </div>
            </div>
            <div className="relative mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-red-500 to-brand-red-700 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="px-7 py-7">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Hola</div>
            <div className="text-2xl font-black uppercase text-zinc-900 leading-tight mt-1">
              {client?.fullName ?? "—"}
            </div>
            <div className="text-sm text-zinc-600 mt-2">
              {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "—"}
              {vehicle ? ` · ${vehicle.color} · placa ${maskPlate(vehicle.plate)}` : ""}
            </div>

            {/* Stepper */}
            <ol className="mt-7 grid grid-cols-5 gap-2">
              {VISIBLE_STAGES.map((s, idx) => {
                const reached = idx <= currentIdx;
                const active = idx === currentIdx && !isCompleted;
                return (
                  <li key={s} className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={
                        active
                          ? "size-9 rounded-xl bg-brand-red-600 text-white text-sm font-black flex items-center justify-center ring-4 ring-brand-red-100"
                          : reached
                            ? "size-9 rounded-xl bg-zinc-900 text-white text-sm font-black flex items-center justify-center"
                            : "size-9 rounded-xl bg-zinc-100 text-zinc-400 text-sm font-bold flex items-center justify-center"
                      }
                    >
                      {reached && !active ? "✓" : idx + 1}
                    </div>
                    <span
                      className={
                        reached
                          ? "text-[10px] font-bold uppercase tracking-wide text-zinc-700 leading-tight"
                          : "text-[10px] font-medium uppercase tracking-wide text-zinc-400 leading-tight"
                      }
                    >
                      {STAGE_LABELS_SHORT[s]}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Last photo */}
            {lastWithPhoto?.photoUrl ? (
              <div className="mt-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-2">
                  Última actualización en taller
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lastWithPhoto.photoUrl}
                  alt="Avance del vehículo"
                  className="w-full rounded-2xl border border-zinc-200 max-h-72 object-cover"
                />
              </div>
            ) : null}

            {/* ETA */}
            <div className="mt-7 rounded-2xl bg-brand-black text-white p-5 ring-1 ring-white/5 relative overflow-hidden">
              <div className="absolute -top-12 -right-10 size-40 rounded-full brand-glow blur-3xl opacity-60 pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                  {isCompleted ? "Entregado" : "Tiempo estimado de entrega"}
                </div>
                <div className="text-base font-black uppercase mt-1 leading-tight">
                  {new Date(isCompleted ? (ticket.completedAt ?? ticket.etaAt) : ticket.etaAt).toLocaleString("es-DO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {isCompleted ? (
                  <div className="text-xs text-zinc-400 mt-2">
                    Tu vehículo está listo para retirar.
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 mt-2">
                    Te avisaremos por WhatsApp cuando esté listo.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-7 py-4 bg-zinc-50 border-t border-zinc-100 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
              3M Pro 100 · Instalador autorizado
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Link único · no compartas · caduca al completar el servicio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

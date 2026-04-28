import "server-only";
import { repos } from "@/lib/repositories";
import {
  STAGES,
  STAGE_ROLE,
  type Role,
  type Stage,
  type StepKey,
} from "@/lib/flow/ppf-stages";
import type { Service, ServiceType, Ticket, User } from "@/lib/schemas";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export interface KpiCard {
  value: number;
  delta?: number;
  helper?: string;
}

export interface OverdueItem {
  id: string;
  vehicleLabel: string;
  clientName: string;
  etaAt: string;
  hoursLate: number;
  status: Stage;
}

export interface UpcomingItem {
  id: string;
  vehicleLabel: string;
  clientName: string;
  etaAt: string;
  hoursUntil: number;
  status: Stage;
}

export interface ProductivityRow {
  userId: string;
  name: string;
  role: Role;
  stepsCompleted: number;
  ticketsTouched: number;
}

export interface DailyBucket {
  date: string;
  created: number;
  delivered: number;
}

export interface DashboardKpis {
  active: { total: number; byStage: Record<Stage, number> };
  deliveriesThisWeek: KpiCard;
  deliveriesThisMonth: KpiCard;
  avgLeadTimeHours: { hours: number | null; sampleSize: number };
  etaCompliance: { rate: number | null; onTime: number; total: number };
  overdue: OverdueItem[];
  upcoming: UpcomingItem[];
  productivity: ProductivityRow[];
  serviceMix: Record<ServiceType, number>;
  offerVehicleShare: { active: number; ratio: number };
  bottleneck: { stage: Stage | null; count: number };
  last14Days: DailyBucket[];
  totals: { tickets: number; clients: number; services: number };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function isoDay(d: Date): string {
  return startOfDay(d).toISOString().slice(0, 10);
}

function leadTimeHours(t: Ticket): number | null {
  if (!t.completedAt) return null;
  const start = new Date(t.createdAt).getTime();
  const end = new Date(t.completedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return (end - start) / HOUR;
}

function vehicleLabelFromMap(
  vehicleId: string,
  vehicles: Map<string, { brand: string; model: string; year: number }>,
): string {
  const v = vehicles.get(vehicleId);
  return v ? `${v.brand} ${v.model} ${v.year}` : "Vehículo";
}

function clientNameFromMap(clientId: string, clients: Map<string, { fullName: string }>): string {
  return clients.get(clientId)?.fullName ?? "Cliente";
}

export async function getDashboardKpis(now = new Date()): Promise<DashboardKpis> {
  const [tickets, clients, vehicles, services, users] = await Promise.all([
    repos.tickets.list(),
    repos.clients.list(),
    repos.vehicles.list(),
    repos.services.list(),
    repos.users.list(),
  ]);

  const vMap = new Map(vehicles.map((v) => [v.id, v]));
  const cMap = new Map(clients.map((c) => [c.id, c]));
  const uMap = new Map(users.map((u) => [u.id, u]));

  const completed = tickets.filter((t) => t.status === "completado" && t.completedAt);

  // ---- active by stage
  const active: DashboardKpis["active"] = {
    total: 0,
    byStage: { recepcion: 0, lavado: 0, aplicacion: 0, qc: 0, entrega: 0, completado: 0 },
  };
  for (const t of tickets) {
    active.byStage[t.status] = (active.byStage[t.status] ?? 0) + 1;
    if (t.status !== "completado") active.total += 1;
  }

  // ---- deliveries this week / month (vs prior period)
  const weekStart = new Date(now.getTime() - 7 * DAY);
  const lastWeekStart = new Date(now.getTime() - 14 * DAY);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const allDeliveries: Array<{ at: Date }> = [
    ...completed.map((t) => ({ at: new Date(t.completedAt as string) })),
    ...services.map((s: Service) => ({ at: new Date(s.completedAt) })),
  ];

  const inRange = (start: Date, end: Date) =>
    allDeliveries.filter((d) => d.at >= start && d.at < end).length;

  const thisWeek = inRange(weekStart, now);
  const lastWeek = inRange(lastWeekStart, weekStart);
  const thisMonth = inRange(monthStart, now);
  const lastMonth = inRange(lastMonthStart, lastMonthEnd);

  // ---- avg lead time and ETA compliance (from completed tickets only)
  const leadTimes = completed.map(leadTimeHours).filter((n): n is number => n !== null);
  const avgLT =
    leadTimes.length === 0
      ? null
      : leadTimes.reduce((s, n) => s + n, 0) / leadTimes.length;

  const etaSample = completed.filter((t) => t.completedAt && t.etaAt);
  const onTime = etaSample.filter(
    (t) => new Date(t.completedAt as string) <= new Date(t.etaAt),
  ).length;

  // ---- overdue & upcoming
  const overdue: OverdueItem[] = tickets
    .filter((t) => t.status !== "completado" && new Date(t.etaAt) < now)
    .map((t) => ({
      id: t.id,
      vehicleLabel: vehicleLabelFromMap(t.vehicleId, vMap),
      clientName: clientNameFromMap(t.clientId, cMap),
      etaAt: t.etaAt,
      hoursLate: (now.getTime() - new Date(t.etaAt).getTime()) / HOUR,
      status: t.status,
    }))
    .sort((a, b) => b.hoursLate - a.hoursLate);

  const upcoming: UpcomingItem[] = tickets
    .filter((t) => t.status !== "completado" && new Date(t.etaAt) >= now)
    .map((t) => ({
      id: t.id,
      vehicleLabel: vehicleLabelFromMap(t.vehicleId, vMap),
      clientName: clientNameFromMap(t.clientId, cMap),
      etaAt: t.etaAt,
      hoursUntil: (new Date(t.etaAt).getTime() - now.getTime()) / HOUR,
      status: t.status,
    }))
    .sort((a, b) => a.hoursUntil - b.hoursUntil)
    .slice(0, 6);

  // ---- productivity (steps completed in last 30 days, per user)
  const cutoff = new Date(now.getTime() - 30 * DAY);
  const counter = new Map<string, { steps: number; tickets: Set<string> }>();
  for (const t of tickets) {
    for (const s of t.steps) {
      if (!s.completed || !s.completedBy || !s.completedAt) continue;
      if (new Date(s.completedAt) < cutoff) continue;
      const u = counter.get(s.completedBy) ?? { steps: 0, tickets: new Set<string>() };
      u.steps += 1;
      u.tickets.add(t.id);
      counter.set(s.completedBy, u);
    }
  }
  const productivity: ProductivityRow[] = [...counter.entries()]
    .map(([userId, agg]) => {
      const u: User | undefined = uMap.get(userId);
      return {
        userId,
        name: u?.name ?? userId,
        role: (u?.role as Role) ?? "tecnico",
        stepsCompleted: agg.steps,
        ticketsTouched: agg.tickets.size,
      };
    })
    .sort((a, b) => b.stepsCompleted - a.stepsCompleted);

  // ---- service mix (across ALL tickets that ever existed + legacy services)
  const serviceMix: Record<ServiceType, number> = { PPF: 0, CeramicCoating: 0, Both: 0 };
  for (const t of tickets) serviceMix[t.serviceType] += 1;
  for (const s of services) serviceMix[s.type] += 1;

  // ---- offer vehicle share (only ACTIVE)
  const activeTickets = tickets.filter((t) => t.status !== "completado");
  const offerActiveCount = activeTickets.filter((t) => t.isOfferVehicle).length;
  const offerRatio = activeTickets.length === 0 ? 0 : offerActiveCount / activeTickets.length;

  // ---- bottleneck: stage with the most ACTIVE tickets right now (excl. completado)
  let topStage: Stage | null = null;
  let topCount = 0;
  for (const stage of STAGES) {
    if (stage === "completado") continue;
    if (active.byStage[stage] > topCount) {
      topCount = active.byStage[stage];
      topStage = stage;
    }
  }

  // ---- last 14 days bucketed
  const last14Days: DailyBucket[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now.getTime() - i * DAY);
    const key = isoDay(day);
    const next = new Date(day.getTime() + DAY);
    const created = tickets.filter((t) => isoDay(new Date(t.createdAt)) === key).length;
    const delivered =
      completed.filter(
        (t) =>
          t.completedAt && new Date(t.completedAt) >= startOfDay(day) && new Date(t.completedAt) < next,
      ).length +
      services.filter(
        (s) =>
          new Date(s.completedAt) >= startOfDay(day) && new Date(s.completedAt) < next,
      ).length;
    last14Days.push({ date: key, created, delivered });
  }

  return {
    active,
    deliveriesThisWeek: { value: thisWeek, delta: thisWeek - lastWeek, helper: "vs semana anterior" },
    deliveriesThisMonth: { value: thisMonth, delta: thisMonth - lastMonth, helper: "vs mes anterior" },
    avgLeadTimeHours: { hours: avgLT, sampleSize: leadTimes.length },
    etaCompliance: {
      rate: etaSample.length === 0 ? null : onTime / etaSample.length,
      onTime,
      total: etaSample.length,
    },
    overdue,
    upcoming,
    productivity,
    serviceMix,
    offerVehicleShare: { active: offerActiveCount, ratio: offerRatio },
    bottleneck: { stage: topStage, count: topCount },
    last14Days,
    totals: { tickets: tickets.length, clients: clients.length, services: services.length },
  };
}

// Suppress unused lint warning for STAGE_ROLE/StepKey re-imports we may use later
void STAGE_ROLE;
void (null as unknown as StepKey);

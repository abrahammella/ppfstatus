import "server-only";
import { repos } from "@/lib/repositories";
import type { Client, Ticket, User, Vehicle } from "@/lib/schemas";

export interface EnrichedTicket extends Ticket {
  client: Client | null;
  vehicle: Vehicle | null;
  tecnico: User | null;
  especialista: User | null;
  qc: User | null;
}

function strip(u: User | null): User | null {
  if (!u) return null;
  return { ...u, passwordHash: "" };
}

export async function listEnrichedTickets(): Promise<EnrichedTicket[]> {
  const [tickets, clients, vehicles, users] = await Promise.all([
    repos.tickets.list(),
    repos.clients.list(),
    repos.vehicles.list(),
    repos.users.list(),
  ]);
  const cMap = new Map(clients.map((c) => [c.id, c]));
  const vMap = new Map(vehicles.map((v) => [v.id, v]));
  const uMap = new Map(users.map((u) => [u.id, u]));
  return tickets
    .map((t) => ({
      ...t,
      client: cMap.get(t.clientId) ?? null,
      vehicle: vMap.get(t.vehicleId) ?? null,
      tecnico: strip(t.assignedTecnicoId ? uMap.get(t.assignedTecnicoId) ?? null : null),
      especialista: strip(t.assignedEspecialistaId ? uMap.get(t.assignedEspecialistaId) ?? null : null),
      qc: strip(t.assignedQcId ? uMap.get(t.assignedQcId) ?? null : null),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getEnrichedTicket(id: string): Promise<EnrichedTicket | null> {
  const ticket = await repos.tickets.findById(id);
  if (!ticket) return null;
  const [client, vehicle, tec, esp, qc] = await Promise.all([
    repos.clients.findById(ticket.clientId),
    repos.vehicles.findById(ticket.vehicleId),
    ticket.assignedTecnicoId ? repos.users.findById(ticket.assignedTecnicoId) : Promise.resolve(null),
    ticket.assignedEspecialistaId ? repos.users.findById(ticket.assignedEspecialistaId) : Promise.resolve(null),
    ticket.assignedQcId ? repos.users.findById(ticket.assignedQcId) : Promise.resolve(null),
  ]);
  return {
    ...ticket,
    client,
    vehicle,
    tecnico: strip(tec),
    especialista: strip(esp),
    qc: strip(qc),
  };
}

import "server-only";
import type { ITicketRepo } from "@/lib/repositories/interfaces";
import type { Ticket } from "@/lib/schemas";
import { mutateCollection, readCollection } from "./storage";

const COLL = "tickets";

export const jsonTicketRepo: ITicketRepo = {
  async list() {
    return readCollection<Ticket>(COLL);
  },
  async findById(id) {
    const rows = await readCollection<Ticket>(COLL);
    return rows.find((t) => t.id === id) ?? null;
  },
  async findByPublicToken(token) {
    const rows = await readCollection<Ticket>(COLL);
    return rows.find((t) => t.publicToken === token) ?? null;
  },
  async create(ticket) {
    await mutateCollection<Ticket>(COLL, (rows) => [...rows, ticket]);
    return ticket;
  },
  async update(id, patch) {
    let updated: Ticket | null = null;
    await mutateCollection<Ticket>(COLL, (rows) =>
      rows.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...patch };
        return updated;
      }),
    );
    if (!updated) throw new Error(`Ticket ${id} not found`);
    return updated;
  },
  async remove(id) {
    await mutateCollection<Ticket>(COLL, (rows) => rows.filter((t) => t.id !== id));
  },
};

import "server-only";
import type { IClientRepo } from "@/lib/repositories/interfaces";
import type { Client } from "@/lib/schemas";
import { mutateCollection, readCollection } from "./storage";

const COLL = "clients";

export const jsonClientRepo: IClientRepo = {
  async list() {
    return readCollection<Client>(COLL);
  },
  async findById(id) {
    const rows = await readCollection<Client>(COLL);
    return rows.find((c) => c.id === id) ?? null;
  },
  async create(client) {
    await mutateCollection<Client>(COLL, (rows) => [...rows, client]);
    return client;
  },
  async update(id, patch) {
    let updated: Client | null = null;
    await mutateCollection<Client>(COLL, (rows) =>
      rows.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...patch };
        return updated;
      }),
    );
    if (!updated) throw new Error(`Client ${id} not found`);
    return updated;
  },
  async remove(id) {
    await mutateCollection<Client>(COLL, (rows) => rows.filter((c) => c.id !== id));
  },
};

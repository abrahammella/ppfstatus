import "server-only";
import type { IVehicleRepo } from "@/lib/repositories/interfaces";
import type { Vehicle } from "@/lib/schemas";
import { mutateCollection, readCollection } from "./storage";

const COLL = "vehicles";

export const jsonVehicleRepo: IVehicleRepo = {
  async list() {
    return readCollection<Vehicle>(COLL);
  },
  async findById(id) {
    const rows = await readCollection<Vehicle>(COLL);
    return rows.find((v) => v.id === id) ?? null;
  },
  async listByClient(clientId) {
    const rows = await readCollection<Vehicle>(COLL);
    return rows.filter((v) => v.clientId === clientId);
  },
  async create(v) {
    await mutateCollection<Vehicle>(COLL, (rows) => [...rows, v]);
    return v;
  },
  async update(id, patch) {
    let updated: Vehicle | null = null;
    await mutateCollection<Vehicle>(COLL, (rows) =>
      rows.map((v) => {
        if (v.id !== id) return v;
        updated = { ...v, ...patch };
        return updated;
      }),
    );
    if (!updated) throw new Error(`Vehicle ${id} not found`);
    return updated;
  },
  async remove(id) {
    await mutateCollection<Vehicle>(COLL, (rows) => rows.filter((v) => v.id !== id));
  },
};

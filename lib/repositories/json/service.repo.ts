import "server-only";
import type { IServiceRepo } from "@/lib/repositories/interfaces";
import type { Service } from "@/lib/schemas";
import { mutateCollection, readCollection } from "./storage";

const COLL = "services";

export const jsonServiceRepo: IServiceRepo = {
  async list() {
    return readCollection<Service>(COLL);
  },
  async listByVehicle(vehicleId) {
    const rows = await readCollection<Service>(COLL);
    return rows.filter((s) => s.vehicleId === vehicleId);
  },
  async listByClient(clientId) {
    const rows = await readCollection<Service>(COLL);
    return rows.filter((s) => s.clientId === clientId);
  },
  async create(s) {
    await mutateCollection<Service>(COLL, (rows) => [...rows, s]);
    return s;
  },
};

import "server-only";
import type { IUserRepo } from "@/lib/repositories/interfaces";
import type { User } from "@/lib/schemas";
import { mutateCollection, readCollection } from "./storage";

const COLL = "users";

export const jsonUserRepo: IUserRepo = {
  async list() {
    return readCollection<User>(COLL);
  },
  async findById(id) {
    const rows = await readCollection<User>(COLL);
    return rows.find((u) => u.id === id) ?? null;
  },
  async findByEmail(email) {
    const rows = await readCollection<User>(COLL);
    return rows.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async create(user) {
    await mutateCollection<User>(COLL, (rows) => [...rows, user]);
    return user;
  },
  async update(id, patch) {
    let updated: User | null = null;
    await mutateCollection<User>(COLL, (rows) =>
      rows.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...patch };
        return updated;
      }),
    );
    if (!updated) throw new Error(`User ${id} not found`);
    return updated;
  },
  async remove(id) {
    await mutateCollection<User>(COLL, (rows) => rows.filter((u) => u.id !== id));
  },
};

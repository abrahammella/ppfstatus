import "server-only";
import type { ICatalogRepo } from "@/lib/repositories/interfaces";
import type { CatalogItem } from "@/lib/schemas";
import { mutateCollection, readCollection } from "./storage";

const COLL = "catalog";

export const jsonCatalogRepo: ICatalogRepo = {
  async list() {
    return readCollection<CatalogItem>(COLL);
  },
  async findById(id) {
    const rows = await readCollection<CatalogItem>(COLL);
    return rows.find((i) => i.id === id) ?? null;
  },
  async create(item) {
    await mutateCollection<CatalogItem>(COLL, (rows) => [...rows, item]);
    return item;
  },
  async update(id, patch) {
    let updated: CatalogItem | null = null;
    await mutateCollection<CatalogItem>(COLL, (rows) =>
      rows.map((i) => {
        if (i.id !== id) return i;
        updated = { ...i, ...patch };
        return updated;
      }),
    );
    if (!updated) throw new Error(`Catalog item ${id} not found`);
    return updated;
  },
  async remove(id) {
    await mutateCollection<CatalogItem>(COLL, (rows) => rows.filter((i) => i.id !== id));
  },
};

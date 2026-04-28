import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

type Locks = Map<string, Promise<unknown>>;
const locks: Locks = new Map();

async function withLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(
    file,
    next.finally(() => {
      if (locks.get(file) === next) locks.delete(file);
    }),
  );
  return next;
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readFileOptional(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function bootstrapFromSeed(file: string, key: string): Promise<unknown[]> {
  const seedRaw = await readFileOptional(SEED_PATH);
  if (!seedRaw) return [];
  const seed = JSON.parse(seedRaw) as Record<string, unknown[]>;
  const arr = Array.isArray(seed[key]) ? (seed[key] as unknown[]) : [];
  await fs.writeFile(file, JSON.stringify(arr, null, 2), "utf-8");
  return arr;
}

export async function readCollection<T>(name: string): Promise<T[]> {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  return withLock(file, async () => {
    const raw = await readFileOptional(file);
    if (raw === null) {
      const seeded = await bootstrapFromSeed(file, name);
      return seeded as T[];
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  });
}

export async function writeCollection<T>(name: string, rows: T[]): Promise<void> {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  await withLock(file, async () => {
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf-8");
    await fs.rename(tmp, file);
  });
}

export async function mutateCollection<T>(name: string, fn: (rows: T[]) => T[] | Promise<T[]>): Promise<T[]> {
  const current = await readCollection<T>(name);
  const next = await fn(current);
  await writeCollection(name, next);
  return next;
}

export function newId(prefix: string): string {
  const s = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += s[Math.floor(Math.random() * s.length)];
  return `${prefix}_${out}`;
}

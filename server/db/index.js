// @ts-check

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { pageVisits } from "./schema.js";

const migrationsFolder = path.join(
  fileURLToPath(path.dirname(import.meta.url)),
  "..",
  "..",
  "drizzle",
);

// Мигратор Drizzle сам базу не блокирует. Сессионная advisory-блокировка с
// постоянным ключом не даёт двум экземплярам приложения применять миграции
// одновременно: второй ждёт, пока первый закончит, и затем видит, что новых
// миграций нет.
const MIGRATION_LOCK_KEY = 7200202611;

/**
 * Метки времени уже применённых миграций. Drizzle пишет в created_at значение
 * when из журнала миграций.
 * @param {pg.Client} client
 */
const appliedMigrations = async (client) => {
  const { rows } = await client.query(
    "SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS present",
  );
  if (!rows[0].present) {
    return new Set();
  }
  const applied = await client.query("SELECT created_at FROM drizzle.__drizzle_migrations");
  return new Set(applied.rows.map((row) => Number(row.created_at)));
};

/**
 * Применяет новые миграции из каталога drizzle и возвращает их имена.
 * @param {string} connectionString
 * @returns {Promise<string[]>}
 */
export const runMigrations = async (connectionString) => {
  const journal = JSON.parse(
    await readFile(path.join(migrationsFolder, "meta", "_journal.json"), "utf8"),
  );
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    const before = await appliedMigrations(client);
    await migrate(drizzle({ client }), { migrationsFolder });
    /** @type {{ tag: string, when: number }[]} */
    const entries = journal.entries;
    return entries.filter((entry) => !before.has(entry.when)).map((entry) => entry.tag);
  } finally {
    await client.end();
  }
};

/** @param {string} connectionString */
export const connect = (connectionString) => drizzle({ connection: { connectionString } });

/**
 * Увеличивает счётчик главной страницы и возвращает новое значение. Один запрос
 * и создаёт строку счётчика, и увеличивает её, поэтому одновременные запросы не
 * теряют посещения.
 * @param {ReturnType<typeof connect>} db
 */
export const countVisit = async (db) => {
  const [row] = await db
    .insert(pageVisits)
    .values({ path: "/", total: 1 })
    .onConflictDoUpdate({ target: pageVisits.path, set: { total: sql`${pageVisits.total} + 1` } })
    .returning({ total: pageVisits.total });
  return row.total;
};

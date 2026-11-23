// @ts-check

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
 * Применяет новые миграции из каталога drizzle.
 * @param {string} connectionString
 */
export const runMigrations = async (connectionString) => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    await migrate(drizzle({ client }), { migrationsFolder });
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

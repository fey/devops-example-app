// @ts-check

import { bigint, pgTable, text } from "drizzle-orm/pg-core";

// Счётчик посещений: путь страницы и число посещений.
// Миграцию по этой схеме создаёт `pnpm exec drizzle-kit generate`.
export const pageVisits = pgTable("page_visits", {
  path: text().primaryKey(),
  total: bigint({ mode: "number" }).notNull(),
});

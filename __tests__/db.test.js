// Тесты с базой идут, когда задан TEST_DATABASE_URL, например
// postgresql://postgres@localhost:5432/paas_test. База очищается.
import fastify from "fastify";
import pg from "pg";

import { runMigrations } from "../server/db/index.js";
import init from "../server/plugin.js";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("database", () => {
  beforeEach(async () => {
    const client = new pg.Client({ connectionString: url });
    await client.connect();
    await client.query("DROP TABLE IF EXISTS page_visits");
    await client.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
    await client.end();
  });

  it("concurrent migrations apply once", async () => {
    // У каждого экземпляра своё подключение, как у отдельных процессов.
    const results = await Promise.all(Array.from({ length: 5 }, () => runMigrations(url)));
    // Миграцию применил один экземпляр, остальные её не повторяли.
    expect(results.flat()).toEqual(["0000_create_page_visits"]);

    const client = new pg.Client({ connectionString: url });
    await client.connect();
    const { rows } = await client.query(
      "SELECT count(*)::int AS applied FROM drizzle.__drizzle_migrations",
    );
    await client.end();
    expect(rows[0].applied).toBe(1);
  });

  it("main page counts visits", async () => {
    await runMigrations(url);
    process.env.DATABASE_URL = url;
    const app = fastify();
    await init(app);
    try {
      // HEAD присылают проверки платформы, посещением он не считается.
      const head = await app.inject({ method: "HEAD", url: "/" });
      expect(head.statusCode).toBe(200);
      for (const visit of [1, 2]) {
        const res = await app.inject({ method: "GET", url: "/" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(`Посещений: ${visit}`);
      }
    } finally {
      delete process.env.DATABASE_URL;
      await app.close();
    }
  });
});

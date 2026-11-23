// @ts-check

// Запускается из bin/start.sh перед сервером. Без DATABASE_URL приложение
// работает без базы, и применять нечего.
import { runMigrations } from "./db/index.js";

const url = process.env.DATABASE_URL;
if (url) {
  for (const name of await runMigrations(url)) {
    console.log(`Applied migration ${name}`);
  }
  console.log("Migrations are up to date");
}

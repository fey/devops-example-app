// @ts-check

import { countVisit } from "./db/index.js";

export default (app) => {
  app.get("/", async (_req, reply) => {
    const serverMessage = process.env.SERVER_MESSAGE;
    // Сбой базы уходит в общий обработчик ошибок: событие в Sentry и ответ 500.
    const visits = app.db ? await countVisit(app.db) : null;

    return reply.view("index", { serverMessage, visits });
  });
  app.get("/error", { name: "error" }, () => {
    throw new Error("Oops! Something went wrong!");
  });
};

// @ts-check

import { countVisit } from "./db/index.js";

export default (app) => {
  app.get("/", async (req, reply) => {
    const serverMessage = process.env.SERVER_MESSAGE;
    // Fastify отвечает на HEAD тем же обработчиком. HEAD присылают проверки
    // платформы при запуске, поэтому посещением считается только GET.
    // Сбой базы уходит в общий обработчик ошибок: событие в Sentry и ответ 500.
    const visits = app.db && req.method === "GET" ? await countVisit(app.db) : null;

    return reply.view("index", { serverMessage, visits });
  });
  app.get("/error", { name: "error" }, () => {
    throw new Error("Oops! Something went wrong!");
  });
};

<div align="center">

<a href="https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=paas-js-app">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Hexlet/brand-assets/master/images/svg/hexlet_wordmark_white_rus.svg">
        <img src="https://raw.githubusercontent.com/Hexlet/brand-assets/master/images/svg/hexlet_wordmark_primary_rus.svg" alt="Хекслет" height="64">
    </picture>
</a>

# JavaScript-приложение для курса «Деплой на PaaS»

[![CI](https://github.com/hexlet-components/paas-js-app/actions/workflows/main.yml/badge.svg)](https://github.com/hexlet-components/paas-js-app/actions/workflows/main.yml)
[![Check](https://github.com/hexlet-components/paas-js-app/actions/workflows/check.yml/badge.svg)](https://github.com/hexlet-components/paas-js-app/actions/workflows/check.yml)

</div>

Компонент создаёт и поддерживает команда [Хекслета](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=paas-js-app), образовательного проекта.

Учебное приложение курса [«Деплой на PaaS»](https://ru.hexlet.io/courses/paas-deploy) для тех, кто проходит курс на JavaScript. Студент делает fork, публикует приложение на Render и учится на нём конфигурации, обновлениям и диагностике. Такие же приложения есть для других стеков курса, у всех одинаковое поведение по HTTP. Изменение маршрутов, ответов или формата лога ломает шаги курса, поэтому такие правки сначала сверяются с уроками.

Приложение выделено из [devops-example-app](https://github.com/hexlet-components/devops-example-app), который остаётся у курсов Docker, Ansible и «Продакшен и деплой».

## Поведение

| Запрос | Ответ |
| --- | --- |
| `GET /` | `200`, заголовок «Привет от Хекслета!», значение `SERVER_MESSAGE`, с `DATABASE_URL` ещё счётчик посещений |
| `GET /error` | `500`, событие уходит в Sentry, процесс продолжает работать |
| другой путь | `404` |

`bin/start.sh` запускает Fastify с адресом `0.0.0.0` на порту из `PORT` (по умолчанию `3000`). Fastify пишет журнал запросов в формате pino. Sentry SDK подключает `instrument.js` и включает переменная `SENTRY_DSN`, без неё события не отправляются.

## Публикация на Render

| Поле | Значение |
| --- | --- |
| Language | Node |
| Build Command | `npm install --global pnpm@12.21.0 && pnpm install --frozen-lockfile && pnpm run build` |
| Start Command | `pnpm start` |
| Environment | `NODE_VERSION=26`, `PORT=3000`, `SERVER_MESSAGE`, по желанию `SENTRY_DSN` и `DATABASE_URL` |

## База данных

С переменной `DATABASE_URL` главная страница считает посещения в таблице `page_visits` и показывает строку «Посещений: N». Адрес имеет вид `postgresql://user:password@host:port/name`, порт необязателен. На Render это Internal Database URL базы из того же региона. Без переменной приложение работает без базы, и страница остаётся прежней.

Схема таблиц описана в `server/db/schema.js`, миграции [Drizzle](https://orm.drizzle.team/) лежат в `drizzle`. `bin/start.sh` сначала запускает `node server/migrate.js`, и только потом стартует Fastify. Мигратор Drizzle сам базу не блокирует, поэтому `server/db/index.js` берёт сессионную advisory-блокировку PostgreSQL на время миграций. Из двух экземпляров, запущенных разом, миграцию применяет один, а второй ждёт и видит её уже применённой. Новая миграция создаётся по изменённой схеме командой `pnpm exec drizzle-kit generate`.

Тесты с базой идут, когда задан `TEST_DATABASE_URL`, и очищают эту базу. Без переменной они пропускаются. В CI базу даёт сервис PostgreSQL из `main.yml`.

## Запуск

```sh
mise run setup
mise run test
PORT=3000 SERVER_MESSAGE="Первая публикация" mise run start
```

`make build` и `make start` повторяют Build Command и Start Command из таблицы выше, `start` перед запуском сам выполняет `build`. Эти две цели работают без mise, нужен только Node.js 26, его установка описана в [инструкции Хекслета](https://github.com/Hexlet/ru-instructions/blob/main/nodejs.md).

`make <задача>` вызывает ту же задачу mise.

## Проверки

`mise run check` гоняет тот же набор, что CI: oxfmt, oxlint, ShellCheck, OSV-Scanner, разметку, опечатки, ссылки, workflows и секреты.

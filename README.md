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
| `GET /` | `200`, заголовок «Привет от Хекслета!» и значение `SERVER_MESSAGE` |
| `GET /error` | `500`, событие уходит в Sentry, процесс продолжает работать |
| другой путь | `404` |

`bin/start.sh` запускает Fastify с адресом `0.0.0.0` на порту из `PORT` (по умолчанию `3000`). Fastify пишет журнал запросов в формате pino. Sentry SDK подключает `instrument.js` и включает переменная `SENTRY_DSN`, без неё события не отправляются.

## Публикация на Render

| Поле | Значение |
| --- | --- |
| Language | Node |
| Build Command | `npm install --global pnpm@12.6.0 && pnpm install --frozen-lockfile && pnpm run build` |
| Start Command | `pnpm start` |
| Environment | `NODE_VERSION=26`, `PORT=3000`, `SERVER_MESSAGE`, по желанию `SENTRY_DSN` |

## Запуск

```sh
mise run setup
mise run test
PORT=3000 SERVER_MESSAGE="Первая публикация" mise run start
```

`make <задача>` вызывает ту же задачу mise.

## Проверки

`mise run check` гоняет тот же набор, что CI: oxfmt, oxlint, ShellCheck, OSV-Scanner, разметку, опечатки, ссылки, workflows и секреты.

#!/usr/bin/env bash

set -e

# С DATABASE_URL сначала применяются миграции, и только потом запускается
# сервер. Ошибка миграции останавливает запуск.
node server/migrate.js

export NODE_OPTIONS="--import ./instrument.js"

exec fastify start server/plugin.js -a 0.0.0.0 -l info -o

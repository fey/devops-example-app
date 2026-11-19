# build и start повторяют команды публикации на Render и работают без mise:
# студенту курса нужен только рантайм стека. Остальные задачи make проксирует
# в mise run, они живут в mise.toml.
build:
	npm install --global pnpm@12.21.0 && pnpm install --frozen-lockfile && pnpm run build

start: build
	pnpm start

.PHONY: build start

# Тонкий прокси: make <задача> запускает mise run <задача>. Задачи живут в mise.toml.
%: FORCE
	@mise run $@

# Без этого правила make пытается собрать сам Makefile через прокси.
Makefile: ;
FORCE: ;

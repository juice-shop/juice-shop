# Этап 1: Установка зависимостей и сборка
FROM node:24.3.0 AS installer

WORKDIR /juice-shop
COPY . /juice-shop

# Устанавливаем зависимости для сборки libxmljs2
RUN apt-get update && apt-get install -y build-essential python3 libxml2-dev

# Устанавливаем глобально TypeScript и ts-node
RUN npm i -g typescript ts-node

# Устанавливаем все зависимости с учетом peer deps
RUN npm install --unsafe-perm --legacy-peer-deps
RUN npm dedupe --legacy-peer-deps

# Чистим ненужные файлы фронтенда и данные
RUN rm -rf frontend/node_modules \
    && rm -rf frontend/.angular \
    && rm -rf frontend/src/assets \
    && mkdir logs \
    && chown -R 65532 logs \
    && chgrp -R 0 ftp/ frontend/dist/ logs/ data/ i18n/ \
    && chmod -R g=u ftp/ frontend/dist/ logs/ data/ i18n/ \
    && rm -f data/chatbot/botDefaultTrainingData.json \
    && rm -f ftp/legal.md \
    && rm -f i18n/*.json

# Устанавливаем CycloneDX и генерируем SBOM
ARG CYCLONEDX_NPM_VERSION=4.0.0
RUN npm install -g @cyclonedx/cyclonedx-npm@$CYCLONEDX_NPM_VERSION
RUN cyclonedx-npm --ignore-npm-errors --output-format json --output-file sbom.json

# Финальный этап: минимальный runtime образ с Node.js 24
FROM node:24.3.0-slim

WORKDIR /juice-shop

# Копируем приложение из предыдущего этапа
COPY --from=installer --chown=65532:0 /juice-shop .

USER 65532

EXPOSE 3000

CMD ["node", "build/app.js"]
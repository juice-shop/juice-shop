FROM node:20-buster AS installer
COPY . /juice-shop
WORKDIR /juice-shop

# Устанавливаем глобально TypeScript и ts-node
RUN npm i -g typescript ts-node

# Устанавливаем все зависимости (включая dev), чтобы sbom сработал корректно
RUN npm install --unsafe-perm --legacy-peer-deps
RUN npm dedupe --legacy-peer-deps

# Чистим фронт и данные
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
RUN cyclonedx-npm --output-format json --output-file sbom.json

# Build libxmljs
FROM node:20-buster AS libxmljs-builder
WORKDIR /juice-shop
RUN apt-get update && apt-get install -y build-essential python3
COPY --from=installer /juice-shop/node_modules ./node_modules
RUN rm -rf node_modules/libxmljs/build && \
    cd node_modules/libxmljs && npm run build

# Final runtime image
FROM gcr.io/distroless/nodejs20-debian12
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop" \
    org.opencontainers.image.description="Probably the most modern and sophisticated insecure web application" \
    org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.vendor="Open Worldwide Application Security Project" \
    org.opencontainers.image.documentation="https://help.owasp-juice.shop" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="17.3.0" \
    org.opencontainers.image.url="https://owasp-juice.shop" \
    org.opencontainers.image.source="https://github.com/juice-shop/juice-shop" \
    org.opencontainers.image.revision=$VCS_REF \
    org.opencontainers.image.created=$BUILD_DATE

WORKDIR /juice-shop
COPY --from=installer --chown=65532:0 /juice-shop .
COPY --chown=65532:0 --from=libxmljs-builder /juice-shop/node_modules/libxmljs ./node_modules/libxmljs

USER 65532
EXPOSE 3000
CMD ["/juice-shop/build/app.js"]

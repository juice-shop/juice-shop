# ---------- Builder stage ----------
FROM node:22.11.0-bullseye AS installer

WORKDIR /juice-shop

# Copy only required project files (whitelist — avoids accidental secrets)
COPY package*.json ./
COPY tsconfig*.json ./
COPY angular.json ./
COPY gulpfile.js ./
COPY server.js ./

# App directories (explicit safe whitelist)
COPY backend ./backend
COPY frontend ./frontend
COPY data ./data
COPY config ./config
COPY i18n ./i18n
COPY scripts ./scripts
COPY lib ./lib

# Install required global tools with pinned versions
ARG CYCLONEDX_NPM_VERSION="2.0.0"
RUN npm install -g typescript@5.6.3 ts-node@10.9.2 "@cyclonedx/cyclonedx-npm@${CYCLONEDX_NPM_VERSION}"

# Install production dependencies safely & reproducibly
RUN npm ci --omit=dev

# Dedupe dependencies
RUN npm dedupe --omit=dev

# Remove unnecessary frontend build artifacts
RUN rm -rf frontend/node_modules frontend/.angular frontend/src/assets

# Prepare runtime dirs
RUN mkdir -p logs \
    && chown -R 65532:0 logs \
    && chgrp -R 0 ftp/ frontend/dist/ logs/ data/ i18n/ \
    && chmod -R g=u ftp/ frontend/dist/ logs/ data/ i18n/

# Remove files that should not ship with the image
RUN rm -f data/chatbot/botDefaultTrainingData.json \
          ftp/legal.md \
          i18n/*.json

# Generate SBOM
RUN npm run sbom


# ---------- Runtime stage ----------
FROM gcr.io/distroless/nodejs22-debian12@sha256:3ae934f1461c2919320b8c228f5788febcc13d953ee7a127d50b371a19b8d20a

ARG BUILD_DATE
ARG VCS_REF

LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
      org.opencontainers.image.title="OWASP Juice Shop" \
      org.opencontainers.image.description="Intentionally insecure demo web application" \
      org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
      org.opencontainers.image.vendor="Open Worldwide Application Security Project" \
      org.opencontainers.image.documentation="https://help.owasp-juice.shop" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="19.1.1" \
      org.opencontainers.image.url="https://owasp-juice.shop" \
      org.opencontainers.image.source="https://github.com/juice-shop/juice-shop" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}"

WORKDIR /juice-shop

# Copy built artifacts with correct ownership
COPY --from=installer --chown=65532:0 /juice-shop ./

# Non-root runtime user
USER 65532

EXPOSE 3000
CMD ["/juice-shop/build/app.js"]


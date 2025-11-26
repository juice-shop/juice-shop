# ---------- Builder stage ----------
FROM node:22.11.0 AS installer

# Copy application
WORKDIR /juice-shop
COPY . .

# Install global tools with pinned version
# (latest is unsafe for reproducible builds)
ARG CYCLONEDX_NPM_VERSION=2.0.0
RUN npm install -g typescript@5.6.3 ts-node@10.9.2 \
    && npm install -g "@cyclonedx/cyclonedx-npm@$CYCLONEDX_NPM_VERSION"

# Install production dependencies only
RUN npm ci --omit=dev

# Reduce duplicates
RUN npm dedupe --omit=dev

# Remove unnecessary frontend build artifacts
RUN rm -rf frontend/node_modules \
    frontend/.angular \
    frontend/src/assets

# Runtime directories
RUN mkdir logs \
    && chown -R 65532:0 logs

# Adjust permissions for read-only rootfs compatibility
RUN chgrp -R 0 ftp/ frontend/dist/ logs/ data/ i18n/ \
    && chmod -R g=u ftp/ frontend/dist/ logs/ data/ i18n/

# Remove files that should not ship in image
RUN rm -f data/chatbot/botDefaultTrainingData.json \
    && rm -f ftp/legal.md \
    && rm -f i18n/*.json

# Generate SBOM
RUN npm run sbom


# ---------- Runtime stage ----------
FROM gcr.io/distroless/nodejs22-debian12

ARG BUILD_DATE
ARG VCS_REF

LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop" \
    org.opencontainers.image.description="Probably the most modern and sophisticated insecure web application" \
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

# Copy built app with correct ownership
COPY --from=installer --chown=65532:0 /juice-shop .

# Run as non-root user
USER 65532

EXPOSE 3000
CMD ["/juice-shop/build/app.js"]


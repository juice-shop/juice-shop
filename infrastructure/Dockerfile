FROM node:20.19.2-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init=1.2.5-* \
    && rm -rf /var/lib/apt/lists/*

FROM node:20.19.2-bookworm AS builder

WORKDIR /juice-shop
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY src/ lib/ frontend/ config/ tsconfig.json server.ts package*.json ./
RUN npm run build && npm prune --production && \
    chown -R root:root /juice-shop && \
    chmod -R u+rwX,go+rX,go-w /juice-shop

FROM base AS production

ENV NODE_ENV=production
WORKDIR /juice-shop

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- --spider http://localhost:3000/ || exit 1

COPY --from=builder /juice-shop .

USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/app.js"]

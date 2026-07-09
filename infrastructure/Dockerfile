FROM node:20.19.2-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init=1.2.5-* \
    && rm -rf /var/lib/apt/lists/*

FROM node:20.19.2-bookworm AS builder

WORKDIR /juice-shop
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm prune --production

FROM base AS production

ENV NODE_ENV=production
WORKDIR /juice-shop

COPY --from=builder --chown=node:node /juice-shop .

USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/app.js"]

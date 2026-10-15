FROM node:24.19.0-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@11.25.0
WORKDIR /workspace

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json turbo.json ./
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/storage/package.json ./packages/storage/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile
COPY packages/contracts ./packages/contracts
COPY packages/database ./packages/database
COPY packages/storage ./packages/storage
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY scripts ./scripts
RUN pnpm build

FROM build AS api
ENV NODE_ENV=production
USER node
EXPOSE 3333
CMD ["node", "apps/api/dist/main.js"]

FROM nginxinc/nginx-unprivileged:1.28-alpine AS web
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 8080

FROM base AS dev
USER root
RUN apt-get update && apt-get install -y --no-install-recommends git curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /workspace/node_modules /workspace/apps/api/node_modules /workspace/apps/web/node_modules /workspace/packages/contracts/node_modules /workspace/packages/database/node_modules /workspace/packages/storage/node_modules && chown -R node:node /workspace
USER node
CMD ["sleep", "infinity"]

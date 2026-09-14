# AdminHub21 API — Hono + drizzle-orm, run with tsx (no build step).
# Build with the repository root as the context:
#   docker build -f apps/server/Dockerfile .

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

# Install workspace dependencies from the lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

RUN corepack enable \
  && pnpm install --frozen-lockfile --prefer-offline --prod=false

COPY packages ./packages
COPY apps/server ./apps/server

# Committed migrations live in apps/server/drizzle; apply them with
# `pnpm --filter @adminhub/server db:migrate` against DATABASE_URL.

WORKDIR /app/apps/server

EXPOSE 8787

CMD ["node", "--import", "tsx", "src/index.ts"]

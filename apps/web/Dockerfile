# Next.js workspace image.
#
# The build context is the repository root: the app depends on the
# `@adminhub/design-tokens` workspace package and on the root lockfile.
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

FROM base AS deps

# Every workspace manifest is copied, not just the Next app's: pnpm validates
# the whole importer set against the lockfile, so a missing manifest makes
# --frozen-lockfile fail.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/laravel/package.json apps/laravel/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
COPY packages/shared/package.json packages/shared/package.json

# The workspace install is pinned by the lockfile; no builds are needed for the
# Next app itself (Turbopack compiles in the next stage).
RUN pnpm install --frozen-lockfile --filter @adminhub/web... --config.minimumReleaseAge=0

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/web ./apps/web
COPY packages ./packages

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @adminhub/web build

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# The public changelog page renders the repository's changelog file.
COPY CHANGELOG.md ./CHANGELOG.md

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["./node_modules/.bin/next", "start", "--hostname", "0.0.0.0", "--port", "3000"]

# Admin SPA image — the Vite admin surface, served by nginx.
#
# The build context is the repository root: the SPA depends on the
# `@adminhub/design-tokens` workspace package and on the root lockfile, so it
# has to be installed with pnpm (there is no package-lock.json to `npm ci`).
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# Every workspace manifest is copied, not just the root one: pnpm validates the
# whole importer set against the lockfile, so a missing manifest makes
# --frozen-lockfile fail.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/laravel/package.json apps/laravel/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --config.minimumReleaseAge=0

COPY . .

# Vite inlines this at build time, so it must be the address the *browser* can
# reach — not a compose service name.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

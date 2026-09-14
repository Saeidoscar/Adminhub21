# AdminHub21 web shell — builds the SPA and serves it through nginx.
# `docker-compose.yml`, `docker-compose.demo.yml` and `docker-compose.prod.yml`
# build this file with the repository root as the context.

FROM node:22-alpine AS builder

WORKDIR /app

# pnpm workspace manifests first, so dependency install is cached.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

RUN corepack enable \
  && pnpm install --frozen-lockfile --prefer-offline

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8787
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

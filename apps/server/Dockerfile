FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared
RUN npm install -g pnpm@9 && pnpm install --frozen-lockfile --prefer-offline

COPY . .

RUN pnpm --filter @adminhub/server exec drizzle-kit generate 2>/dev/null || true

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/drizzle ./apps/server/drizzle
COPY --from=builder /app/apps/server/src ./apps/server/src
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/apps/server/tsconfig.json ./apps/server/tsconfig.json

WORKDIR /app/apps/server

EXPOSE 8787

CMD ["node", "--import", "tsx", "src/index.ts"]

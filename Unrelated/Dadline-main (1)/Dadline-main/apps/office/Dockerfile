# apps/office/Dockerfile
# Production build — Next.js 16 + pnpm workspaces (Turborepo)
# همین الگو برای apps/admin و apps/office هم تکرار می‌شود؛ فقط APP_NAME تغییر می‌کند.

ARG APP_NAME=office

# ── مرحله‌ی ۱: نصب وابستگی‌ها (کل monorepo، برای cache بهتر) ──
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/office/package.json ./apps/office/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/utils/package.json ./packages/utils/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json

RUN pnpm install --frozen-lockfile --filter=office...

# ── مرحله‌ی ۲: بیلد ──
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/office/node_modules ./apps/office/node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=office

# ── مرحله‌ی ۳: ایمیج نهایی (فقط خروجی standalone) ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/office/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/office/.next/static ./apps/office/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/office/public ./apps/office/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "apps/office/server.js"]

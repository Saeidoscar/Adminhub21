# Dadline — ساختار نهایی پروژه
> تاریخ انتشار » 2026/06/30
> این نسخه به‌طور کامل با ۱۸ سند معماری رسمی پروژه (`01` تا `18`) همسو شده است.
---

## تصمیمات معماری

| موضوع | تصمیم | منبع |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | سند ۰۲ |
| Frontend | Next.js 16 + React 19 (همه‌ی اپ‌ها) | سند ۰۱، ۰۷ |
| Backend | Laravel 13 / PHP 8.4 | سند ۰۱ |
| معماری Backend | Modular Monolith + Pragmatic DDD | سند ۰۳، ۰۴ |
| Database | PostgreSQL 17 — **یک schema واحد** | سند ۰۵ |
| Auth | **Auth.js v5 + Laravel Sanctum** | سند ۰۶ |
| Cache / Queue | Redis 8 | سند ۰۱، ۰۳ |
| Storage (Prod) (Dev) | S3 Compatible (ArvanCloud Object Storage یا مشابه) | سند ۱۰ |
| Styling | Tailwind CSS v4 + shadcn/ui | سند ۰۱، ۰۷ |
| UI Package | `@dadline/ui` | سند ۰۲، ۱۲ |
| Reverse Proxy | Traefik v2 | سند ۰۱، ۱۰ |
| Package Manager | pnpm | سند ۰۲ |
| Primary Key | **UUID v7** | سند ۰۵ |
| API | REST، نسخه‌بندی‌شده `/api/v1` | سند ۰۸ |
| Testing | Pest (Backend) / Vitest + Playwright (Frontend) | سند ۱۴ |
| CI/CD | GitHub Actions + GHCR | سند ۱۱ |

---

## نکته‌ی فنی: UUID v7 در PostgreSQL 17

سند ۰۵ استفاده از **UUID v7** را الزامی کرده است، اما تابع داخلی
`uuidv7()` تنها از **PostgreSQL 18** به بعد به هستهٔ PostgreSQL اضافه
شده است. بنابراین در **PostgreSQL 17** این تابع به‌صورت پیش‌فرض در
دسترس نیست و بهترین راهکار استفاده از افزونهٔ `pg_uuidv7` است.

**استفاده از extension `pg_uuidv7`**

```sql
CREATE EXTENSION IF NOT EXISTS pg_uuidv7;

-- سپس در هر جدول:
id UUID PRIMARY KEY DEFAULT uuid_generate_v7()

---

## نقشه سرویس‌ها

```
dadline.net           ← سایت عمومی + پنل کاربر   (Next.js 16)
admin.dadline.net     ← پنل مدیریت               (Next.js 16)
office.dadline.net    ← پنل وکلا و کارشناسان     (Next.js 16)
api.dadline.net       ← REST API + Auth (Sanctum) (Laravel 13)
s3.dadline.net        ← Object Storage
```
---

## ریشه Monorepo

ساختار ریشه دقیقاً مطابق سند ۰۲ (Root Responsibilities: فقط Workspace،
Docker، Scripts، Documentation، CI/CD — بدون Business Logic):

```
dadline/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml       ← از develop
│   │   └── deploy-production.yml    ← از main
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   ├── web/
│   ├── admin/
│   ├── office/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── utils/
│   ├── config/
│   ├── eslint/
│   ├── typescript/
│   └── api-client/
│
├── infrastructure/
│   ├── docker/
│   ├── traefik/
│   ├── postgres/
│   ├── redis/
│   ├── backup/
│   └── monitoring/
│
├── docs/
│   ├── architecture/        ← همین ۱۸ سند
│   ├── adr/
│   └── api/
│
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   ├── backup.sh
│   ├── restore.sh
│   ├── seed.sh
│   └── reset.sh
│
├── tooling/
│   └── husky/
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── .editorconfig
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```
---

## packages/ — کتابخانه‌های مشترک

ساختار کامل مطابق سند ۱۲:

```
packages/ui/
├── components/
├── hooks/
├── providers/
├── styles/
├── icons/
├── tokens/
├── themes/
└── index.ts

packages/api-client/
├── client/
├── repositories/
├── interceptors/
├── types/
├── errors/
└── index.ts

packages/types/
├── api/
├── entities/
├── common/
├── auth/
└── index.ts

packages/utils/
├── date/
├── currency/
├── string/
├── validation/
├── number/
├── download/
└── clipboard/

packages/config/
├── tailwind/
├── eslint/
├── prettier/
└── tsconfig/
```

### packages/types — نمونه‌ی به‌روزشده

سند ۰۵ صراحتاً تأکید دارد JSON فقط برای داده‌ی Dynamic است، نه برای
فیلدهای اصلی. تایپ زیر هم با این قاعده هم‌راستا و هم با UUID v7 سازگار
است (از منظر TypeScript نوع‌اش هنوز `string` است؛ تفاوت فقط در نحوه‌ی
تولید سمت دیتابیس است):

```ts
// packages/types/src/entities/user.types.ts
export interface User {
  id:         string          // UUID v7
  first_name: string
  last_name:  string
  mobile:     string
  email?:     string
  role:       UserRole
  isVendor:   boolean
  avatarUrl?: string
  createdAt:  string          // ISO-8601
  updatedAt:  string
}

export type UserRole =
  | 'super_admin' | 'admin' | 'lawyer' | 'expert' | 'user'

// packages/types/src/api/response.types.ts
// مطابق سند ۰۸: شکل استاندارد پاسخ (بدون status/success/result اضافه)
export interface ApiResponse<T> {
  data: T
}

export interface ApiCollectionResponse<T> {
  data: T[]
  meta: { currentPage: number; perPage: number; total: number }
  links: { next: string | null; prev: string | null }
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
```

### packages/api-client — Repository Pattern (سند ۰۲)

```ts
// packages/api-client/src/repositories/case.repository.ts
import { apiClient } from '../client'
import type { Case, ApiResponse, ApiCollectionResponse } from '@dadline/types'

export const CaseRepository = {
  list: (params?: { status?: string; page?: number }) =>
    apiClient.get<ApiCollectionResponse<Case>>('/cases', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Case>>(`/cases/${id}`),

  create: (data: CreateCaseInput) =>
    apiClient.post<ApiResponse<Case>>('/cases', data),
}
```
> طبق سند ۰۷: «هیچ Component نباید `fetch()` یا `axios()` را مستقیماً
> صدا بزند» — همیشه از طریق این Repository ها.

---

## apps/web, apps/admin, apps/office — ساختار Frontend

مطابق سند ۰۷ (Feature-Sliced) و سند ۱۲:

```
apps/web/
├── src/
│   ├── app/                       ← فقط Routing، بدون Business Logic
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/                  ← هر قابلیت مستقل
│   │   ├── create-case/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── search-lawyer/
│   │   └── payment/
│   │
│   ├── entities/                  ← نماینده‌ی موجودیت‌ها
│   │   ├── user/
│   │   ├── case/
│   │   └── document/
│   │
│   ├── widgets/                   ← ترکیب چند Feature
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Dashboard/
│   │
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── auth.ts                    ← NextAuth config
│   ├── auth.config.ts
│   ├── proxy.ts
│   └── providers/
│
├── public/{fonts,images,icons}/
├── Dockerfile
├── Dockerfile.dev
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Layer Import Rules (سند ۰۷، ۱۲)

```
مجاز:    app → widgets → features → entities → shared
غیرمجاز: shared → features  (وابستگی معکوس)
غیرمجاز: feature-a → feature-b  (مستقیم؛ فقط از طریق shared یا API)
```

---

## apps/api — Backend (Pragmatic DDD)

ساختار مطابق سند ۰۳، ۰۴، ۱۲ — هر Domain یک Bounded Context مستقل با
چهار لایه:

```
apps/api/
├── app/
│   ├── Domain/
│   │   ├── Auth/
│   │   │   ├── Application/
│   │   │   │   ├── Actions/
│   │   │   │   │   ├── RegisterUserAction.php
│   │   │   │   │   ├── VerifyOtpAction.php
│   │   │   │   │   └── LoginAction.php
│   │   │   │   ├── DTOs/
│   │   │   │   │   ├── RegisterUserData.php
│   │   │   │   │   └── LoginData.php
│   │   │   │   └── Queries/
│   │   │   ├── Domain/
│   │   │   │   ├── Models/User.php
│   │   │   │   ├── Enums/UserRole.php
│   │   │   │   ├── Events/UserRegistered.php
│   │   │   │   └── Policies/UserPolicy.php
│   │   │   ├── Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   └── Services/OtpService.php
│   │   │   ├── Presentation/
│   │   │   │   ├── Controllers/AuthController.php
│   │   │   │   ├── Requests/{Register,Login}Request.php
│   │   │   │   └── Resources/UserResource.php
│   │   │   └── Tests/{Feature,Unit}/
│   │   │
│   │   ├── Cases/
│   │   │   ├── Application/
│   │   │   │   ├── Actions/
│   │   │   │   │   ├── CreateCaseAction.php
│   │   │   │   │   ├── UpdateCaseAction.php
│   │   │   │   │   └── CloseCaseAction.php
│   │   │   │   ├── DTOs/CreateCaseData.php
│   │   │   │   └── Queries/ActiveCasesQuery.php
│   │   │   ├── Domain/
│   │   │   │   ├── Models/Cases.php
│   │   │   │   ├── Enums/CaseStatus.php
│   │   │   │   ├── Events/CaseCreated.php
│   │   │   │   └── Policies/CasePolicy.php
│   │   │   ├── Infrastructure/Repositories/CaseRepository.php
│   │   │   ├── Presentation/
│   │   │   │   ├── Controllers/CaseController.php
│   │   │   │   ├── Requests/CreateCaseRequest.php
│   │   │   │   └── Resources/CaseResource.php
│   │   │   └── Tests/
│   │   │
│   │   ├── Lawyers/
│   │   ├── Documents/
│   │   ├── Billing/
│   │   ├── Notifications/
│   │   ├── Search/
│   │   ├── AI/
│   │   ├── Settings/
│   │   └── Reports/
│   │
│   ├── Shared/
│   │   ├── Enums/
│   │   ├── Exceptions/
│   │   │   ├── AppException.php
│   │   │   ├── BusinessException.php
│   │   │   └── PaymentFailedException.php
│   │   ├── Traits/
│   │   ├── Contracts/
│   │   └── Support/
│   │
│   └── Support/
│       └── Helpers/
│
├── bootstrap/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   │   ├── CoreSeeder.php
│   │   ├── DevelopmentSeeder.php
│   │   └── DemoSeeder.php
│   └── factories/
├── routes/
│   └── api.php
├── storage/
└── tests/
    ├── Feature/
    ├── Unit/
    ├── Integration/
    ├── Architecture/        ← Pest Architecture Tests (سند ۱۴)
    └── Performance/
```

### نمونه‌ی Domain کامل (مطابق سند ۰۳/۰۴)

```php
<?php
declare(strict_types=1);

namespace App\Domain\Cases\Application\Actions;

use App\Domain\Cases\Application\DTOs\CreateCaseData;
use App\Domain\Cases\Domain\Models\Cases;
use App\Domain\Cases\Domain\Events\CaseCreated;

final class CreateCaseAction
{
    public function __construct(
        private readonly CaseRepository $repository,
    ) {}

    public function execute(CreateCaseData $data): Cases
    {
        $case = $this->repository->create($data);

        event(new CaseCreated($case));

        return $case;
    }
}
```

```php
<?php
declare(strict_types=1);

namespace App\Domain\Cases\Presentation\Controllers;

use App\Domain\Cases\Application\Actions\CreateCaseAction;
use App\Domain\Cases\Presentation\Requests\CreateCaseRequest;
use App\Domain\Cases\Presentation\Resources\CaseResource;

final class CaseController
{
    // Controller فقط HTTP: دریافت Request → Action → Resource (سند ۰۳)
    public function store(CreateCaseRequest $request, CreateCaseAction $action): CaseResource
    {
        $case = $action->execute($request->toDto());

        return new CaseResource($case);
    }
}
```

---

## Authentication & Authorization — جزئیات اتصال (سند ۰۶)

سند ۰۶ معماری را مشخص کرده («Auth.js + Sanctum، کوکی») اما
نحوه‌ی واقعی اتصال سه ساب‌دامین فرانت‌اند به یک API مرکزی را باز نکرده.
این بخش آن جزئیات فنی را تکمیل می‌کند، چون بدون آن‌ها فقط یک تصمیم
سطح‌بالا روی کاغذ می‌ماند:

### چالش: کوکی Cross-Subdomain

`dadline.net`, `admin.dadline.net`, `office.dadline.net` سه origin مجزا
هستند اما باید به یک Sanctum session (روی `api.dadline.net`) متصل شوند.
Sanctum's SPA authentication دقیقاً برای این سناریو طراحی شده، با دو
پیش‌نیاز:

```php
// apps/api/config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', implode(',', [
    'dadline.net',
    'admin.dadline.net',
    'office.dadline.net',
]))),
```

```php
// apps/api/config/session.php
'domain' => env('SESSION_DOMAIN', '.dadline.net'),  // نقطه‌ی ابتدایی: همه‌ی ساب‌دامین‌ها
'same_site' => 'lax',   // مطابق سند ۱۵: SameSite=Lax
'secure' => true,       // مطابق سند ۱۵: Secure
'http_only' => true,    // مطابق سند ۱۵: HttpOnly
```

### جریان واقعی Login (تطبیق سند ۰۶ Login Flow با Auth.js)

```text
کاربر فرم لاگین را در apps/web پر می‌کند
  ↓
Auth.js Credentials Provider صدا زده می‌شود (سمت سرور Next.js)
  ↓
ابتدا GET /sanctum/csrf-cookie به api.dadline.net (دریافت XSRF-TOKEN)
  ↓
سپس POST /login به api.dadline.net با همان CSRF token
  ↓
Laravel کوکی session را با domain=.dadline.net ست می‌کند
  ↓
Auth.js این session را در خودش به‌عنوان signed-in تشخیص می‌دهد
  و یک session JWT امضاشده‌ی خودِ Auth.js (نه از Laravel) برای
  middleware داخلی Next.js می‌سازد — این توکن صرفاً برای routing
  داخلی Next.js است، هرگز به مرورگر یا localStorage نمی‌رود، و
  جایگزین کوکی Sanctum نیست؛ هردو هم‌زمان فعال‌اند.
```

```ts
// apps/web/src/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        // مرحله‌ی ۱: گرفتن CSRF cookie از Sanctum
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
          credentials: 'include',
        })

        // مرحله‌ی ۲: لاگین واقعی روی Sanctum
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })

        if (!res.ok) return null
        const { data: user } = await res.json()
        return user   // فقط برای session داخلی Auth.js؛ بدون token
      },
    }),
  ],
  session: { strategy: 'jwt' },  // این JWT مخصوص خودِ Auth.js است، نه
                                  // معادل توکن API — سند ۰۶ این تفکیک
                                  // را مجاز می‌داند چون هرگز به Browser
                                  // Storage نمی‌رود و فقط HttpOnly کوکی
                                  // امضاشده‌ی خودِ Auth.js است.
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: { httpOnly: true, sameSite: 'lax', secure: true, domain: '.dadline.net' },
    },
  },
})
```

### Authorization — Policy Based (سند ۰۶، الزامی)

```php
// apps/api/app/Domain/Cases/Domain/Policies/CasePolicy.php
final class CasePolicy
{
    public function update(User $user, Cases $case): bool
    {
        return $user->id === $case->lawyer_id
            || $user->can('case.update');
    }
}
```

```php
// در Controller (سند ۰۶: ممنوع بودن Role Check مستقیم)
// ❌ ممنوع:
if ($user->role === 'admin') { ... }

// ✅ الزامی:
$this->authorize('update', $case);
```

---

## Database — اعمال سند ۰۵ روی اسکیمای قبلی

اسکیمای PostgreSQL که قبلاً برای پروژه نوشته شد (یکی‌سازی جداول
وردپرسی، حذف schema دوگانه) از نظر **ساختار رابطه‌ای** هنوز معتبر است،
اما باید سه تغییر زیر روی آن اعمال شود تا با سند ۰۵ کاملاً همسو باشد:

1. **`gen_random_uuid()` → `uuid_generate_v7()`** (پس از نصب
   `pg_uuidv7`، طبق توضیح بالا) در `DEFAULT` همه‌ی ستون‌های `id`.
2. **Cascade Rules:** سند ۰۵ صراحتاً می‌گوید پیش‌فرض باید `RESTRICT`
   باشد، نه `CASCADE` — «حذف آبشاری فقط در موارد خاص مجاز است». اسکیمای
   قبلی از `ON DELETE CASCADE` به‌صورت گسترده استفاده کرده بود (اقتباس
   مستقیم از پترن وردپرس). این باید بازبینی شود: `CASCADE` فقط برای
   روابط «جزء از کل» واقعی (مثل `message → conversation`,
   `case_party → case`) درست است؛ برای روابط «اشاره به» (مثل
   `case.office_id → offices`) باید `RESTRICT` باشد تا حذف تصادفی یک
   دفتر، پرونده‌های مرتبط را پاک نکند.
3. **Audit Log جداگانه:** سند ۰۵ یک جدول `audit_logs` عمومی با ساختار
   `id, user_id, action, entity, entity_id, ip, user_agent, payload,
   created_at` تعریف کرده که در اسکیمای قبلی وجود نداشت (قبلاً audit
   به‌صورت پراکنده در `case_actions` بود). این باید به‌عنوان یک جدول
   عمومی مستقل اضافه شود، مکمل (نه جایگزین) `case_actions` که مخصوص
   لاگ‌های دامنه‌ی پرونده است.

```sql
-- اضافه به اسکیما، مطابق ساختار دقیق سند ۰۵
CREATE EXTENSION IF NOT EXISTS pg_uuidv7;

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,      -- مثل 'login', 'case.created'
  entity      VARCHAR(100),               -- مثل 'cases'
  entity_id   UUID,
  ip          VARCHAR(45),
  user_agent  TEXT,
  payload     JSONB,                      -- داده‌ی Dynamic، مطابق سند ۰۵
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
-- این جدول هرگز updated_at ندارد: لاگ Audit به تعریف باید Append-Only باشد.
```

> اسکیمای کامل به‌روزشده (با `uuid_generate_v7()`، بازبینی Cascade، و
> جدول `audit_logs`) باید به‌عنوان فایل جداگانه بازنویسی و دوباره روی
> یک PostgreSQL واقعی تست شود — این یک تغییر به‌اندازه‌ی کافی بزرگ است
> که نباید فقط روی کاغذ فرض شود؛ پیشنهاد می‌شود به‌عنوان قدم بعدی همین
> session مستقیماً انجام شود.

---

## infrastructure/

```
infrastructure/
├── docker/
│   ├── compose/
│   ├── development/
│   └── production/
│
├── traefik/
│   ├── traefik.yml
│   ├── dynamic/
│   │   ├── middlewares.yml
│   │   └── otp-rate-limit.yml      ← rate-limit سخت‌گیرانه برای /otp/*
│   └── certificates/
│
├── postgres/
│   ├── Dockerfile                  ← postgres:17-alpine + نصب pg_uuidv7
│   └── init/01-init.sql
│
├── redis/
│   └── redis.conf
│
├── backup/
│   └── pg_dump scripts روزانه/هفتگی/ماهانه (سند ۰۵)
│
└── monitoring/
    └── (Health Check فعلاً؛ Prometheus/Grafana/Loki/Tempo در آینده — سند ۱۳)
```

```dockerfile
# infrastructure/postgres/Dockerfile
FROM postgres:17-alpine

RUN apk add --no-cache git build-base postgresql17-dev clang llvm \
    && git clone https://github.com/fboulnois/pg_uuidv7.git /tmp/pg_uuidv7 \
    && cd /tmp/pg_uuidv7 && make && make install \
    && apk del git build-base clang llvm \
    && rm -rf /tmp/pg_uuidv7
```

```yaml
# infrastructure/traefik/dynamic/otp-rate-limit.yml
# مطابق سند ۱۵: OTP محدود به 3 درخواست در دقیقه
http:
  middlewares:
    otp-strict-ratelimit:
      rateLimit:
        average: 3
        period: 1m
        burst: 5
        sourceCriterion:
          requestHeaderName: X-Forwarded-For
```

---

## docker-compose.yml

```yaml
name: dadline

networks:
  proxy:        # شبکه‌ی عمومی — فقط Traefik (سند ۱۰)
  backend:      # ارتباط بین سرویس‌های پروژه
  internal:     # سرویس‌هایی که نباید از بیرون دیده شوند

volumes:
  postgres_data:
  redis_data:
  traefik_certs:

services:

  traefik:
    image: traefik:v2.11
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./infrastructure/traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./infrastructure/traefik/dynamic:/etc/traefik/dynamic:ro
      - traefik_certs:/certs
    networks: [proxy, backend]

  web:
    build: { context: ./apps/web }
    restart: unless-stopped
    env_file: ./apps/web/.env
    networks: [proxy]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`dadline.net`)"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"

  admin:
    build: { context: ./apps/admin }
    restart: unless-stopped
    env_file: ./apps/admin/.env
    networks: [proxy]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.admin.rule=Host(`admin.dadline.net`)"
      - "traefik.http.routers.admin.tls.certresolver=letsencrypt"

  office:
    build: { context: ./apps/office }
    restart: unless-stopped
    env_file: ./apps/office/.env
    networks: [proxy]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.office.rule=Host(`office.dadline.net`)"
      - "traefik.http.routers.office.tls.certresolver=letsencrypt"

  api:
    build: { context: ./apps/api }
    restart: unless-stopped
    env_file: ./apps/api/.env
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    networks: [proxy, backend, internal]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.dadline.net`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"

  horizon:
    build: { context: ./apps/api }
    command: php artisan horizon
    restart: unless-stopped
    env_file: ./apps/api/.env
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    networks: [backend, internal]

  scheduler:
    build: { context: ./apps/api }
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
    restart: unless-stopped
    env_file: ./apps/api/.env
    networks: [backend, internal]

  postgres:
    build: ./infrastructure/postgres     # سند ۰۵: PostgreSQL 17 + pg_uuidv7
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init:/docker-entrypoint-initdb.d:ro
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: dadline
    networks: [internal]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d dadline"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    restart: unless-stopped
    command: redis-server /etc/redis/redis.conf
    volumes:
      - redis_data:/data
      - ./infrastructure/redis/redis.conf:/etc/redis/redis.conf:ro
    networks: [internal]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
```

---

## .env — نمونه برای apps/api/.env

```bash
# ── App ──────────────────────────────────────────
APP_NAME=Dadline
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://api.dadline.net

# ── Database ─────────────────────────────────────
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=dadline
DB_USERNAME=dadline
DB_PASSWORD=...

# ── Redis (Session + Cache + Queue) ─────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=...
SESSION_DRIVER=redis
SESSION_DOMAIN=.dadline.net
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# ── Sanctum ──────────────────────────────────────
SANCTUM_STATEFUL_DOMAINS=dadline.net,admin.dadline.net,office.dadline.net

# ── CORS ─────────────────────────────────────────
CORS_ALLOWED_ORIGINS=https://dadline.net,https://admin.dadline.net,https://office.dadline.net

# ── Storage (Production = S3 Compatible) ──
FILESYSTEM_DISK=s3
AWS_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
AWS_BUCKET=dadline-documents
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_USE_PATH_STYLE_ENDPOINT=true

# ── SMS (OTP) ────────────────────────────────────
MELLI_PAYAMAK_API_KEY=...
ADLI_PAYAMAK_API_KEY=...

# ── Rate Limits (سند ۱۵) ─────────────────────────
RATE_LIMIT_LOGIN=5,1          # 5 درخواست در 1 دقیقه
RATE_LIMIT_OTP=3,1
RATE_LIMIT_SEARCH=30,1
RATE_LIMIT_API=60,1
```

```bash
# apps/web/.env (و معادل برای admin/office با NEXTAUTH_URL متفاوت)
AUTH_SECRET=...
NEXT_PUBLIC_API_URL=https://api.dadline.net
NEXTAUTH_URL=https://dadline.net
AUTH_TRUST_HOST=true
```

---

## Testing — اسکلت اولیه مطابق سند ۱۴

```
apps/api/tests/
├── Unit/
│   └── Domain/Cases/CaseStatusTest.php
├── Feature/
│   └── Domain/Cases/CreateCaseTest.php
├── Integration/
│   └── Domain/Documents/UploadToStorageTest.php
├── Architecture/
│   └── LayerDependencyTest.php          ← تست خودکار قانون «Feature
│                                            نباید Feature دیگر را
│                                            Import کند» (سند ۱۲، ۱۴)
└── Performance/
```

```php
<?php
// apps/api/tests/Architecture/LayerDependencyTest.php
// مطابق سند ۱۴: «Architecture Test باید قوانین معماری را در CI تضمین کند»
arch('Domains do not depend on each other directly')
    ->expect('App\Domain\Cases')
    ->not->toUse('App\Domain\Billing');

arch('Controllers are thin — no direct Eloquent query')
    ->expect('App\Domain\*\Presentation\Controllers')
    ->not->toUse(['Illuminate\Database\Eloquent\Builder']);
```

> Coverage هدف طبق سند ۱۴: Backend ≥ ۹۰٪، Frontend ≥ ۸۰٪،
> Architecture Tests = ۱۰۰٪ (هیچ Layer-Violation مجاز نیست).

---

## CI/CD — Pipeline مطابق سند ۱۱

```yaml
# .github/workflows/ci.yml — خلاصه‌ی مراحل
# Checkout → Install (pnpm + composer) → Static Analysis
#   (ESLint/TypeScript + PHPStan/Pint) → Unit Tests (Vitest/Pest)
#   → Integration Tests → Build (Next.js + Laravel + Docker Images)
#   → Push GHCR → [فقط روی main/develop] SSH Deploy → Migration
#   → Rolling Restart → Health Check
```

Image tags مطابق سند ۱۱: `latest`, `v2.0.0`, `sha-xxxxxxxx` — هر
ایمیج Immutable است و دوباره tag نمی‌شود.

---

## راه‌اندازی

```bash
# ۱. clone و نصب
git clone git@github.com:farhadtl/dadline.git
cd dadline
pnpm install

# ۲. env — هر اپ فایل env مستقل خودش (سند ۰۲)
cp apps/web/.env.example    apps/web/.env
cp apps/admin/.env.example  apps/admin/.env
cp apps/office/.env.example apps/office/.env
cp apps/api/.env.example    apps/api/.env

# ۳. اجرای زیرساخت (Development)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis

# ۴. migrations + seed (سند ۰۵: سه نوع Seeder)
docker compose exec api php artisan migrate
docker compose exec api php artisan db:seed --class=CoreSeeder
docker compose exec api php artisan db:seed --class=DevelopmentSeeder   # فقط dev

# ۵. اجرای Frontend ها با Turborepo
pnpm dev

# ۶. تست (سند ۱۴)
docker compose exec api php artisan test --parallel
pnpm test          # Vitest
pnpm test:e2e       # Playwright

# ۷. production build
docker compose build --no-cache
docker compose up -d
```
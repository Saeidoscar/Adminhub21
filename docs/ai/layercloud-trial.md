# LayerCloud trial route — runbook

Status: **wired, disabled by default, training circle only.**
Owner surface: `apps/api` (Laravel API). Nothing on the Next.js site or the Vite UI calls it directly.

LayerCloud AI (`https://ai.layercloud.org`) is a reseller gateway with an OpenAI-compatible API in front of
~128 models at roughly 25–75% of list price. The full commercial/legal assessment is in
[`docs/research/layercloud-gateway-assessment.md`](../research/layercloud-gateway-assessment.md). This file is the
operating manual.

## 1. What "Free models" means here

Their pricing page marks models **Free** when *no top-up is required* — every token is still billed against the
signup credit. There is no $0 tier, so this route has a hard daily token budget instead of an assumption of free
capacity. Only Free-badge **text** models are allowed: image/video models are priced per token at $2–33 per 1M with
an 8K context window, the worst value on the catalogue.

| Model id | Context | $/1M in | $/1M out | Use it for |
| --- | --- | --- | --- | --- |
| `deepseek/deepseek-v4-flash-0731` | 1.3M | 0.0163 | 0.0450 | ticket triage, summaries, cheap chat |
| `zai/glm-5.3-flash` | 1.3M | 0.0187 | 0.0625 | **default**: general assistant drafting |
| `deepseek/deepseek-v4.1-flash` | 1.0M | 0.0375 | 0.1500 | vision-light triage |
| `alibaba/qwen3.7-pro` | 1.0M | 0.0800 | 0.3200 | Persian i18n drafting, moderation pre-screen |
| `minimax/minimax-m3` | 1.0M | 0.0750 | 0.3000 | general chat |
| `zai/glm-5.2` | 1.0M | 0.2415 | 0.7590 | reasoning-heavy drafting |
| `deepseek/deepseek-v4-pro-0813` | 1.0M | 0.2802 | 0.8405 | best cheap reasoner (SWE 83.9 / GPQA 84.1) |
| `moonshotai/kimi-k2.7-code` | 262K | 0.1650 | 0.8500 | code-shaped tasks |
| `openai/gpt-5.3` | 400K | 0.4375 | 3.5000 | coding agent work (this is GPT-5.3-Codex) |
| `google/gemini-3.6-flash` | 1.0M | 0.1875 | 0.9375 | multimodal experiments |

Pricing captured 2026-11-01 and mirrored in `config('services.layercloud.model_pricing')`. Re-check before relying on
the cost estimate: the gateway's own `usage` payload is the billing truth, and their "Save X%" badges are computed on
a 3:1 blended mix (some models are *more* expensive than official on input).

## 2. Guard rails (all enforced in code, all fail closed)

`App\Services\Ai\Guardrails\TrialGuard` and `App\Services\Ai\Providers\LayerCloudProvider`:

| Rail | Behaviour |
| --- | --- |
| `LAYERCLOUD_ENABLED=false` | Provider refuses to send anything; `AIProviderFactory` still resolves it so the failure is a clear 502-class error, not a 500. |
| `LAYERCLOUD_TRIAL_ONLY=true` | Refuses to run at all when `APP_ENV=production`. The trial cannot be promoted by forgetting to change one variable. |
| Free-tier allow-list | `config('services.layercloud.free_models')`, optionally narrowed by `LAYERCLOUD_ALLOWED_MODELS`. Anything else is refused before a request is made. |
| De-aligned variants | `:jailbreak` / `:uncensored` ids are refused even if someone adds them to the allow-list. |
| Daily token budget | Rolling per-UTC-day counter in cache (`LAYERCLOUD_DAILY_TOKEN_BUDGET`, default 200k). Blocks the next call once spent. |
| Output clamp | `max_tokens` is capped at `LAYERCLOUD_MAX_OUTPUT_TOKENS` (default 1024) so one call cannot burn the budget. |
| PII redaction | Emails, IBANs, card numbers, Iranian mobile numbers and 10-digit national IDs/postal codes are replaced with `[redacted:<kind>]` before the payload leaves the process. |
| No secrets in errors | Upstream failures surface status + truncated upstream message; the API key never appears in an exception or a log line. |

Redaction is a **backstop**, not permission. The scope rule still stands:

> Assistant chat, ticket triage, i18n drafting and moderation pre-screening may use this route.
> Contracts, identity documents, payment/wallet data and admin user records may not.

## 3. Setup

### Where the key lives

The key is **never committed**. It is read from `LAYERCLOUD_API_KEY`, which you set in one of:

| Context | File | Committed? |
| --- | --- | --- |
| `php artisan serve` / local PHP | `apps/api/.env` | no (`.gitignore` covers `.env*`) |
| Docker Compose | root `.env`, interpolated by `docker-compose.yml` into the `api` **and** `horizon` containers | no |
| CI / deploy | the platform's secret store | n/a |

`apps/api/.env.example` documents every variable with empty values; copy it and fill in the key.

```dotenv
LAYERCLOUD_ENABLED=true
LAYERCLOUD_TRIAL_ONLY=true
LAYERCLOUD_API_KEY=lc_...
LAYERCLOUD_DEFAULT_MODEL=zai/glm-5.3-flash
LAYERCLOUD_DAILY_TOKEN_BUDGET=200000
LAYERCLOUD_MAX_OUTPUT_TOKENS=1024
```

### Prove the key works before wiring anything

The sandbox that authored this change has no route to `ai.layercloud.org` (TLS reset), so the connectivity check has
to run from your machine or the container:

```bash
node scripts/layercloud-smoke.mjs              # 3 cheapest free models
node scripts/layercloud-smoke.mjs --all        # every allow-listed model
node scripts/layercloud-smoke.mjs --model=zai/glm-5.2
node scripts/layercloud-smoke.mjs --redaction  # also prints the PII filter output
```

It prints latency, token counts and measured spend per model, and exits non-zero if any call fails. Then, inside the
API container:

```bash
docker compose exec api php artisan tinker
>>> app(App\Services\Ai\AIProviderFactory::class)->make('layercloud')
    ->chat([['role' => 'user', 'content' => 'Reply with: ok']]);
```

### Seed the catalogue

`LayerCloudModelSeeder` is intentionally **not** part of `DatabaseSeeder` — the trial is opt-in:

```bash
docker compose exec api php artisan db:seed --class=LayerCloudModelSeeder
```

It inserts rows with `provider = 'layercloud'` and the per-1M prices above, which is what the existing
wallet/markup code (`ai_models.in_usd` / `out_usd`) reads. 10 models are seeded active, 7 inert rows inactive.

### Use it from the API

`POST /api/v1/ai/analyze` now accepts `provider: "layercloud"` (validation reads `AIProviderFactory::supported()`),
and `GET /api/v1/ai/providers` reports the fence state — enabled flag, trial-only flag, allowed models and today's
budget — without exposing the key:

```json
{
  "providers": ["openai", "anthropic", "openrouter", "layercloud"],
  "layercloud": {
    "enabled": true,
    "trial_only": true,
    "default_model": "zai/glm-5.3-flash",
    "free_models": ["zai/glm-5.3-flash", "deepseek/deepseek-v4-flash-0731", "..."],
    "budget": { "used_today": 0, "daily_budget": 200000, "remaining": 200000 }
  }
}
```

For a conversation-based flow, point `ai_conversations.model_id` at a seeded `layercloud` row, as the queue job
(`ProcessAiRequest`, queue `ai-default`) resolves the provider from `ai_models.provider`.

## 4. Operating it

**Rotate the key**: issue a new token in the LayerCloud console (scoped: one token per environment, with a USD quota
and a model allow-list), replace `LAYERCLOUD_API_KEY`, then
`php artisan config:clear` (or restart the containers). Revoke the old token — ToS §4 makes every request billed to
the token owner.

**Kill switch**: set `LAYERCLOUD_ENABLED=false` and clear config. No deployment needed; the guard rejects every call.

**Watch the spend**: `GET /ai/providers` for the token counter, and the gateway console for the USD balance. The
gateway does not charge failed `4xx/5xx` requests, so retries on upstream errors are free — but a valid response is
billed even if the app later discards it.

**Fallback**: this route has no SLA (97.5% success/24h, 99.36% uptime/90d) and failed calls raise
`App\Exceptions\Ai\AiProviderException`. `ProcessAiRequest` retries 3× within 120s; anything user-facing that must not
degrade should keep OpenAI/Anthropic as the primary and treat LayerCloud as the secondary, not the other way round.

## 5. Known gaps before this could ever be more than a trial

1. **No DPA, no sub-processor list, no EU residency.** Upstream providers receive the payload under their own
   retention rules (their privacy policy §4 says so explicitly).
2. **Sanctions / export-control review** is outstanding for an EU-based operator: support is `@layercloud.ir` and
   payments run through Zarinpal (Rial/card) and Plisio (crypto). Their ToS §8 excludes liability for
   "upstream provider blocks or sanctions".
3. **No model pinning.** The gateway buys bulk capacity and routes to the cheapest upstream; you cannot guarantee
   which provider (or quantisation) served a request. Fine for drafting, not for anything contractual.
4. **Catalogue drift.** Model ids, availability and prices change without notice; the allow-list is a snapshot and
   `LayerCloudModelSeeder` must be kept in sync with `config('services.layercloud.free_models')`.

Anything that clears all four is a decision for the owner, not for this document.

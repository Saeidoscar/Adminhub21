# LayerCloud AI gateway — fit assessment for AdminHub21 and related repositories

Date: 2026-11-01
Sources reviewed: <https://ai.layercloud.org/pricing>, `/`, `/docs`, `/faq`, `/privacy`, `/tos`, `/register`, plus individual model pages (`/pricing/zai-glm-5-2`).

## Verdict in one paragraph

LayerCloud is a **reseller gateway**, not a model provider: one key, OpenAI/Anthropic-compatible endpoints
(`https://ai.layercloud.org/v1`, `/v1/chat/completions`, `/v1/messages`, `/v1/embeddings`), 128 models, priced at
roughly 25–75% of the upstream list price. The "Free" tier is **not free** — it means *no top-up required*, and every
token is still billed against the signup bonus / prepaid balance. So the question is not "free models" but "is a
25–75%-off router worth a dependency?". For AdminHub21 the honest answer is: **yes for cheap, non-sensitive,
high-volume Chinese-lab models (DeepSeek / GLM / Qwen / MiniMax) and for developer-side coding agents; no for
anything carrying contract text, identity documents or payment data, and no as a primary/sole provider.**

## 1. What the "Free" badge actually means

Straight from the pricing page:

> "Free-tier models are open to every account (billed per token against your signup bonus or balance), while
> Paid-tier models unlock after your first top-up."

So:

- There is **no $0 model tier**. "Free" = available *before* your first payment. The signup bonus is finite and
  unlocks only after linking GitHub/Google or verifying an email.
- Everything is prepaid. ToS §7: top-ups are **final and non-refundable**, balance never expires, failed `4xx/5xx`
  requests are not charged.
- The gateway does not publish a free request-per-day allowance, so you cannot plan capacity on a "free plan". Treat
  the bonus as a trial credit, not as an operating budget line.

## 2. Models that matter (Free tier, text/chat, live prices per 1M tokens)

| Model id | Context | In / Out | Notes |
| --- | --- | --- | --- |
| `deepseek/deepseek-v4-flash-0731` | 1.3M | $0.0163 / $0.045 | Cheapest usable chat model on the list; SWE 77.4 / GPQA 76.8 |
| `zai/glm-5.3-flash` | 1.3M | $0.0187 / $0.0625 | Same family as GLM 5.3, image+video input |
| `openai/gpt-oss` | 131K | $0.02 / $0.08 | Small OpenAI OSS model, unknown actual hosting |
| `deepseek/deepseek-v4.1-flash` | 1.0M | $0.0375 / $0.15 | Vision-capable |
| `alibaba/qwen3.7-pro` | 1.0M | $0.08 / $0.32 | SWE 82.6 / GPQA 83.0 — strong multilingual (Persian) |
| `minimax/minimax-m3` | 1.0M | $0.075 / $0.30 | SWE 78.6, documented as the default example model |
| `zai/glm-5.2` | 1.0M | $0.2415 / $0.759 | SWE 80.4 / GPQA 79.8, 131K max output |
| `deepseek/deepseek-v4-pro-0813` | 1.0M | $0.2802 / $0.8405 | SWE 83.9 / GPQA 84.1 — best cheap reasoner here |
| `moonshotai/kimi-k3` | 1.0M | $0.75 / $3.75 | SWE 83.2, more expensive than DeepSeek V4 Pro |
| `moonshotai/kimi-k2.7-code` | 262K | $0.165 / $0.85 | Coding-focused, good value for agent work |
| `openai/gpt-5.3` (GPT-5.3-Codex) | 400K | $0.4375 / $3.50 | SWE 87.5 / GPQA 85.4 — best coding value on the list |
| `google/gemini-3.6-flash` | 1.0M | $0.1875 / $0.9375 | Multimodal (text/image/video/audio) |
| `anthropic/claude-sonnet-5` | 1M | $0.50 / $2.50 | Paid tier only (needs a top-up) |

Also on the list but *not* recommended: `zai/glm-5.2`-class models missing tool-calling, and the whole
`:jailbreak` / `:uncensored` family (e.g. `zai/glm-5.3:jailbreak`, `alibaba/qwen3.8-max:uncensored`,
`meta/muse-spark-1.2:jailbreak`). A consumer marketplace with moderation obligations should never route
user-facing generation through deliberately de-aligned variants.

### Price-claim caveat (important)

The "Save X%" badges are computed on a 3:1 blended mix and are not always true per direction. Two examples from the
live table:

- `deepseek/deepseek-v4-pro-0813`: gateway **$0.2802** input vs "official $0.115" — the gateway input is ~2.4× *more*
  expensive; the saving is entirely on output ($0.8405 vs $4.00).
- `zai/glm-5.2`: gateway **$0.2415** input vs "official $0.006" — ~40× more expensive on input, despite a "Save 78%"
  badge.

Conclusion: re-price each candidate against the model you actually use today; do not take the badge at face value.

## 3. Cost model for the AdminHub21 AI assistant

Repo baseline today: `apps/api/app/Services/Ai/AiService.php` → `AIProviderFactory` → OpenAI / Anthropic /
OpenRouter, with the OpenRouter provider hardcoded to `openai/gpt-4o-mini` and `AiModel.in_usd/out_usd`
(`ai_models` table) already carrying per-model prices for markup/wallet logic.

Assuming a typical assistant turn of **1.5k input + 400 output tokens**:

| Model | Cost / message | Messages per $1 | 1,000 messages |
| --- | --- | --- | --- |
| `gpt-4o-mini` direct (current default) | 0.0465¢ | 2,151 | $0.465 |
| `deepseek/deepseek-v4-flash-0731` | 0.0042¢ | 23,557 | $0.042 |
| `zai/glm-5.3-flash` | 0.0053¢ | 18,850 | $0.053 |
| `openai/gpt-oss` | 0.0062¢ | 16,129 | $0.062 |
| `deepseek/deepseek-v4.1-flash` | 0.0116¢ | 8,602 | $0.116 |
| `minimax/minimax-m3` | 0.0232¢ | 4,301 | $0.233 |
| `alibaba/qwen3.7-pro` | 0.0248¢ | 4,032 | $0.248 |
| `moonshotai/kimi-k2.7-code` | 0.0588¢ | 1,702 | $0.588 |
| `zai/glm-5.2` | 0.0666¢ | 1,502 | $0.666 |
| `deepseek/deepseek-v4-pro-0813` | 0.0756¢ | 1,322 | $0.757 |
| `anthropic/claude-sonnet-5` | 0.1750¢ | 571 | $1.750 |
| `openai/gpt-5.3` (Codex) | 0.2056¢ | 486 | $2.056 |

Reading: the cheap Flash tier is **~10× cheaper than the `gpt-4o-mini` baseline per message**, and a strong reasoner
(DeepSeek V4 Pro / GLM 5.2) still lands at a fraction of a frontier model. At the volumes a marketplace assistant
generates, the absolute money is small either way — the real value is in the *higher-quality-per-dollar* tier
(a SWE 83.9 / GPQA 84.1 reasoner for $0.28/$0.84 in/out), not in the literal free credit.

## 4. Where it actually helps — by repository

### AdminHub21 (this repo) — primary candidate

| Workload in the repo | Fit | Suggested model class |
| --- | --- | --- |
| AI assistant chat (`ProcessAiRequest`, `ai-default` queue) | Good, non-sensitive prompts | `zai/glm-5.2` / `deepseek/deepseek-v4-pro-0813` for reasoning, Flash tier for small talk |
| Moderation pre-screening of stories/blogs/comments (Persian) | Good as *pre-screen only*, human review after | `alibaba/qwen3.7-pro` + JSON mode |
| Ticket triage / thread summarisation | Strong fit | `deepseek/deepseek-v4-flash-0731` |
| i18n drafting en↔fa (`src/i18n/`) | Strong fit, models are strong in Persian | `qwen3.7-pro` / `glm-5.2` |
| Contract clause drafting / PDF text generation | **Not** recommended as the sole path | legal-sensitive + PII; keep OpenAI/Anthropic primary, use gateway only with redaction and human review |
| Identity / payment / wallet flows | **Never** route here | PII + sanctions/AML exposure |
| Dev-side coding agents on this monorepo | Strong fit | `openai/gpt-5.3` (Codex) or `moonshotai/kimi-k2.7-code` with a scoped token |
| Image/video generation | Poor value — image models are billed per token at $2–33/1M with only 8K context | skip |

### `Saeidoscar/cafialmasbot` (Telegram bot + Playwright agent, Persian slot-filling on `gpt-4o-mini`)

- Technically an obvious cost cut: the Persian FSM slot-filling is exactly the `qwen3.7-pro` / `glm-5.3-flash`
  sweet spot, and the bot already talks to an OpenAI-compatible API — a base-URL swap is nearly enough.
- But the payloads are **citizens' national-ID / government-portal data**. A reseller gateway that explicitly
  disclaims responsibility for confidential data (see §5) is the wrong place for that. Recommendation: leave
  `cafialmasbot` on the official provider; if cost is the driver, use the gateway only for the non-PII parts
  (intent classification, help text, translation of service descriptions).

### `Saeidoscar/AmlakNeshan`

- Currently a README-only repository — nothing to integrate. Worth remembering as a future candidate for cheap
  Persian-language listing description generation / dedup, again with no PII.

### Legacy backends (`apps/server`, `apps/laravel`)

- No action. `apps/server/src/lib/ai/provider-factory.ts` mirrors the same factory pattern; if the gateway lands it
  should land in `apps/api/` only.

## 5. Risk register (read before adopting)

1. **"Free" is a trial credit, not a free tier.** No published rate allowance, no guarantee it survives; plan a paid
   budget or don't plan on it.
2. **Jurisdiction and sanctions.** Support is `@layercloud.ir`, payments are Zarinpal (Rial/card) and Plisio
   (crypto). For an EU-domiciled operator (this checkout runs from Germany) and for international customers, there
   are real sanctions/export-control and PSP questions before any production use. ToS §8 also excludes "upstream
   provider blocks or sanctions" from liability. Get a legal opinion before wiring this into a payment-taking
   marketplace.
3. **GDPR / data transfer.** `/privacy` §4 is explicit: prompt content is forwarded to upstream providers and
   governed by *their* policies; "zero storage here does not mean zero storage upstream"; it warns against sending
   "confidential, regulated, medical, or contractually confidential data". There is no DPA, no sub-processor list,
   no EU data-residency option, and the controller (LayerCloud) is not established in the EU. Contract text, IDs,
   and bank details must not go through it.
4. **Model identity is not verifiable.** The gateway "purchases capacity in bulk and routes requests across
   providers for the best rate". You cannot pin which upstream actually served a request, nor whether quantization
   or context truncation changed behaviour. Fine for drafting, bad for anything you would put in a contract.
5. **Availability.** Published figures: 97.5% success rate (24h), 99.36% uptime (90d), while the ToS "targets
   99.99%". Single point of failure with no SLA and no refunds (§7, §8). Requires a fallback chain, and failed
   upstream calls are at least not billed.
6. **ToS shifts all liability to the user** (§1–§3), including indemnification. Acceptable for internal tooling,
   not for a compliance-sensitive product surface.
7. **Noise in the catalogue.** Jailbroken/uncensored variants, "temporarily unavailable" image models, benchmark
   numbers that repeat per family, and model ids that do not match upstream naming
   (`openai/gpt-5.3` = GPT-5.3-Codex). Any integration needs a curated allow-list, not "serve whatever the API
   returns".
8. **Billing semantics differ from direct providers.** `usage.prompt_tokens/completion_tokens` is billed exactly as
   reported (good), but the project's `ai_models.in_usd/out_usd` markup logic would need the gateway prices seeded
   per model id, and wallet reconciliation should key on request id.

## 6. If we adopt it: minimal integration shape

The codebase is already well set up for this — the only hardcoding that blocks a second OpenAI-compatible endpoint
is the base URL in `OpenRouterProvider` and the provider enum in `AiController::analyze`.

1. **Generalise the OpenAI-compatible provider** instead of adding a fourth class: make base URL + default model
   configurable per provider entry, keep `OpenRouterProvider`'s headers optional.

   ```php
   // apps/api/config/services.php
   'layercloud' => [
       'api_key'  => env('LAYERCLOUD_API_KEY'),
       'base_url' => env('LAYERCLOUD_BASE_URL', 'https://ai.layercloud.org/v1'),
       'models'   => array_filter(explode(',', (string) env('LAYERCLOUD_MODELS', ''))),
   ],
   ```

2. **Register the provider** in `AIProviderFactory::make()` (`'layercloud' => new OpenAICompatibleProvider(...)`) and
   add it to the `in:openai,anthropic,openrouter` validation list in `AiController::analyze()`.
3. **Seed `ai_models` rows** for the curated ids with `provider = 'layercloud'` and the gateway's `in_usd/out_usd`,
   so the existing wallet/markup code works unchanged.
4. **Route by task, not globally**: keep OpenAI/Anthropic for anything touching contracts, IDs, or money; send
   `ai-default` chat, moderation pre-screen, ticket triage and i18n drafting to the gateway. Per-queue model choice
   keeps blast radius small.
5. **Add a fallback chain** (`layercloud → openrouter → openai`) with a circuit breaker after N consecutive 5xx,
   since the gateway has no SLA.
6. **Ops**: scoped token per environment with a USD quota and model allow-list (the console supports both), plus
   alerting on spend and on `429/502` rate.

## 7. Recommendation

- **Pilot, don't migrate.** Create one account, spend nothing beyond the signup bonus, and point a **scoped token**
  at two internal, non-PII workloads: (a) i18n draft translation for `src/i18n/`, (b) the developer coding agent for
  refactors in this monorepo (`openai/gpt-5.3`, `moonshotai/kimi-k2.7-code`).
- **Then evaluate** `zai/glm-5.2` and `deepseek/deepseek-v4-pro-0813` as a *second* model option for the assistant
  chat, A/B'd against today's default on real Persian prompts, with the wallet markup seeded.
- **Do not** put it in the contract generator, the wallet/payment paths, or `cafialmasbot`'s government-portal flows.
- **Decision gate before any production traffic**: legal review of sanctions/export-control and GDPR posture
  (§5.2, §5.3). If that comes back negative — which, for an EU operator, is a plausible outcome — the remaining
  upside is developer tooling only, and even that can be served by the official provider keys the repo already
  supports.

Net: the useful part for this project is **cheap, capable Chinese-lab models at roughly a quarter of list price**,
not the "free" tier. The cheapest defensible path is to use it as a *development-time and non-PII drafting* router,
behind the existing provider abstraction, with the current providers retained as the compliance-grade path.

---

## 8. What was implemented (2026-11-01)

The pilot from §6 is wired, disabled by default and fenced off:

- `App\Services\Ai\Providers\OpenAICompatibleProvider` — one implementation for every OpenAI-dialect endpoint;
  `OpenAIProvider` and `OpenRouterProvider` now extend it instead of duplicating the HTTP call.
- `App\Services\Ai\Providers\LayerCloudProvider` — gateway route with guard rails.
- `App\Services\Ai\Guardrails\TrialGuard` — enable flag, production refusal while trial-only, free-badge
  allow-list, `:jailbreak`/`:uncensored` refusal, daily token budget.
- `App\Services\Ai\Guardrails\PromptRedactor` — emails, IBANs, cards, Iranian mobiles and 10-digit national IDs /
  postal codes are stripped before the payload leaves the app.
- `AIProviderFactory::supported()` drives request validation; `GET /api/v1/ai/providers` exposes the fence state.
- `LayerCloudModelSeeder` (opt-in, not in `DatabaseSeeder`) seeds the free-badge catalogue with live prices.
- `scripts/layercloud-smoke.mjs` (`pnpm layercloud:smoke`) proves the key and each model from outside the app.

Runbook: [`docs/ai/layercloud-trial.md`](../ai/layercloud-trial.md). Nothing in §5 is resolved by this — it is still a
trial route, not a production provider.

# Dadline Telegram Relay

Cloudflare Worker relay for sending Dadline notifications to Telegram without a direct connection from the Iranian application server.

## Security model

- `TELEGRAM_BOT_TOKEN` exists only as a Cloudflare Worker secret.
- Laravel and the Worker share `DADLINE_RELAY_SECRET`.
- Every request is signed with HMAC-SHA256 over `<unix_timestamp>.<raw_json_body>`.
- Requests older than five minutes are rejected.
- Only `POST /v1/telegram/sendMessage` is forwarded.
- The Telegram destination is fixed in Worker code, preventing arbitrary upstream requests.

## Deploy

From this directory:

```powershell
pnpm dlx wrangler@latest login
```

Create a local secret file that is excluded from Git:

```dotenv
TELEGRAM_BOT_TOKEN=123456:bot-token-from-botfather
DADLINE_RELAY_SECRET=replace-with-a-random-secret-at-least-32-bytes
```

Save it as `.env`, then deploy code and secrets together:

```powershell
pnpm dlx wrangler@latest deploy --secrets-file .env
```

The command prints a URL such as:

```text
https://dadline-telegram-relay.<account-subdomain>.workers.dev
```

Laravel must use the full endpoint:

```text
https://dadline-telegram-relay.<account-subdomain>.workers.dev/v1/telegram/sendMessage
```

## Health check

```powershell
curl.exe https://dadline-telegram-relay.<account-subdomain>.workers.dev/health
```

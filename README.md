# The Business Builder

Marketing site plus client accounts. A paid subscription on a client's account unlocks the AI assistant (Claude) and deadline email alerts sent 7 days, 1 day and 1 hour before each deadline.

- `public/` – the static marketing pages (home, quiz, assessment), served as-is.
- `src/app` – Next.js app: sign up, log in, dashboard, AI assistant, API routes.
- `src/lib/reminders.ts` – when each alert is due.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run db:migrate
npm run dev
```

## Services

| Service | Used for | Env vars |
|---|---|---|
| Postgres | accounts, sessions, deadlines | `DATABASE_URL` |
| Stripe | subscription that unlocks the AI | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` |
| Anthropic | AI assistant | `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` |
| Resend | reminder emails | `RESEND_API_KEY`, `EMAIL_FROM` |

Stripe webhook: point it at `/api/stripe/webhook` with the `customer.subscription.created`, `.updated` and `.deleted` events.

Reminders: `vercel.json` runs `/api/cron/reminders` every 15 minutes (needs a Vercel plan that allows that schedule). Set `CRON_SECRET`; Vercel sends it as a bearer token.

## Checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
```
